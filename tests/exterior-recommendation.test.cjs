// Run: node --test tests/exterior-recommendation.test.cjs
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { create, act } = require('react-test-renderer');
global.IS_REACT_ACT_ENVIRONMENT = true;
const root = path.resolve(__dirname, '..');

function loader(mocks) {
  const cache = {};
  function load(file) {
    const filename = path.resolve(root, file);
    if (cache[filename]) return cache[filename].exports;
    const module = { exports: {} }; cache[filename] = module;
    const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
    }).outputText;
    vm.runInNewContext(compiled, {
      module, exports: module.exports, console, setTimeout, clearTimeout,
      require(name) {
        if (Object.hasOwn(mocks, name)) return mocks[name];
        if (name.startsWith('.')) {
          const target = path.resolve(path.dirname(filename), name);
          for (const ext of ['.ts', '.tsx']) if (fs.existsSync(target + ext)) return load(target + ext);
        }
        return require(name);
      },
    }, { filename });
    return module.exports;
  }
  return load;
}
const deferred = () => { let resolve, reject; const promise = new Promise((a,b) => {resolve=a;reject=b;}); return {promise,resolve,reject}; };
async function hook(post, initial = {tail:' n123qa ', customer:42}) {
  let value; let errors = 0;
  const useHook = loader({'../services/httpService': {post}})('hooks/useExteriorServiceRecommendation.ts').useExteriorServiceRecommendation;
  function Capture({tail, customer}) { value = useHook(tail, customer, () => errors++); return null; }
  let renderer;
  await act(async()=> {renderer=create(React.createElement(Capture, initial));});
  return { get value(){return value;}, get errors(){return errors;},
    async update(props){await act(async()=>renderer.update(React.createElement(Capture,props)));},
    async close(){await act(async()=>renderer.unmount());},
  };
}

test('uses the web endpoint and request contract; displays API decision without a local threshold', async()=> {
  const calls=[];
  const h=await hook(async(url,body)=>{calls.push([url,body]);return {show_recommendation:true,arrived_flights_count:1};});
  await act(async()=>h.value.check());
  assert.equal(calls[0][0],'/tail-exterior-level-2-checker');
  assert.deepEqual(JSON.parse(JSON.stringify(calls[0][1])),{tail_number:'N123QA',customer_id:42,ident:''});
  assert.equal(h.value.recommendation.show_recommendation,true);
  assert.equal(h.value.recommendation.arrived_flights_count,1);
  await h.close();
});
for(const payload of [{show_recommendation:false},{show_recommendation:false,arrived_flights_count:99}]) {
  test(`API false hides recommendation, even with count ${payload.arrived_flights_count}`,async()=>{
    const h=await hook(async()=>payload); await act(async()=>h.value.check());
    assert.equal(h.value.recommendation.show_recommendation,false); await h.close();
  });
}
for(const initial of [{tail:' ',customer:42},{tail:'N123QA',customer:null}]) {
  test(`missing request context does not call endpoint: ${JSON.stringify(initial)}`,async()=>{
    let calls=0;const h=await hook(async()=>{calls++;},initial);await act(async()=>h.value.check());
    assert.equal(calls,0);assert.equal(h.value.recommendation,null);await h.close();
  });
}
test('switching tail or customer clears results and ignores old responses',async()=>{
  const a=deferred(),b=deferred();let calls=0;
  const h=await hook(()=>++calls===1?a.promise:b.promise);
  let first;await act(async()=>{first=h.value.check();});
  await h.update({tail:'N456QA',customer:84});
  let second;await act(async()=>{second=h.value.check();});
  await act(async()=>{b.resolve({show_recommendation:false});await second;});
  await act(async()=>{a.resolve({show_recommendation:true,arrived_flights_count:19});await first;});
  assert.equal(h.value.recommendation.show_recommendation,false);
  await h.update({tail:'N456QA',customer:85});assert.equal(h.value.recommendation,null);await h.close();
});
test('new check replaces old result, failures show error, and another check can recover',async()=>{
  let calls=0;const h=await hook(async()=>{if(++calls===2)throw Error('offline');return {show_recommendation:true,arrived_flights_count:19};});
  await act(async()=>h.value.check());assert.equal(h.value.recommendation.show_recommendation,true);
  await act(async()=>h.value.check());assert.equal(h.value.recommendation,null);assert.equal(h.errors,1);
  await act(async()=>h.value.check());assert.equal(h.value.recommendation.arrived_flights_count,19);await h.close();
});
for (const action of ['reset','unmount']) test(`${action} ignores in-flight success and failure`,async()=>{
  for(const fail of [false,true]){
    const pending=deferred();const h=await hook(()=>pending.promise);let request;
    await act(async()=>{request=h.value.check();});
    if(action==='reset') await act(async()=>h.value.reset());else await h.close();
    await act(async()=>{fail?pending.reject(Error('offline')):pending.resolve({show_recommendation:true,arrived_flights_count:19});await request;});
    assert.equal(h.errors,0);assert.equal(h.value.recommendation,null);if(action==='reset')await h.close();
  }
});

const native = {
  View:'View', Text:'Text', TouchableOpacity:'TouchableOpacity',
  StyleSheet:{create:x=>x},useWindowDimensions:()=>({width:390}),
  Platform:{OS:'ios'},UIManager:{},LayoutAnimation:{configureNext(){},Presets:{easeInEaseOut:{}}},
  Animated:{View:'AnimatedView',Value:class {interpolate(){return '0deg';}},timing:()=>({start(){}})},
};
const ui=loader({'react-native':native,'@expo/vector-icons':{MaterialIcons:'MaterialIcons'}});
const Section=ui('components/ServicesSection.tsx').default;
function text(node){if(node==null)return '';if(typeof node==='string'||typeof node==='number')return String(node);if(Array.isArray(node))return node.map(text).join('');return text(node.children);}
async function section(extra={}) {
  let renderer;const toggled=[];
  const props={interiorServices:[],otherServices:[],currentUser:{},exteriorServices:[
    {id:1,name:'Basic Exterior (Lvl 1)',short_name:'Basic wash'},
    {id:2,name:'Exterior Wash (Ext. Level 2)',is_exterior_detail_level_2:true},
    {id:3,name:'Brightwork'},
  ],onToggleService:item=>toggled.push(item.id),...extra};
  await act(async()=>{renderer=create(React.createElement(Section,props));});
  await act(async()=>renderer.root.findAllByType('TouchableOpacity').find(n=>text(n)==='Exterior').props.onPress());
  return {renderer,toggled};
}
test('warning text, count, colors and both pills match web; non-recommended service remains selectable',async()=>{
  const {renderer,toggled}=await section({exteriorRecommendation:{show_recommendation:true,arrived_flights_count:19}});
  assert.match(text(renderer.toJSON()),/Exterior Service RecommendationThis aircraft has completed 19 flight\(s\) since its last Exterior Detail\./);
  const alert=renderer.root.findByProps({accessibilityRole:'alert'});
  assert.equal(alert.props.style.backgroundColor,'#fef2f2');assert.equal(alert.props.style.borderColor,'#fecaca');
  assert.equal(renderer.root.findAllByType('Text').filter(n=>text(n)==='NOT RECOMMENDED').length,1);
  assert.equal(renderer.root.findAllByType('Text').filter(n=>text(n)==='RECOMMENDED').length,1);
  const basic=renderer.root.findAllByType('TouchableOpacity').find(n=>text(n).includes('Basic wash'));
  await act(async()=>basic.props.onPress());assert.deepEqual(toggled,[1]);
  await act(async()=>renderer.unmount());
});
for(const recommendation of [null,{show_recommendation:false,arrived_flights_count:19}]) test(`hidden recommendation has no notice or pills: ${JSON.stringify(recommendation)}`,async()=>{
  const {renderer}=await section({exteriorRecommendation:recommendation});
  assert.doesNotMatch(text(renderer.toJSON()),/Recommendation|RECOMMENDED/);await act(async()=>renderer.unmount());
});
test('uses full service name, case-sensitive web match and server flag rather than displayed short name',async()=>{
  const {renderer}=await section({exteriorRecommendation:{show_recommendation:true,arrived_flights_count:19},exteriorServices:[
    {id:1,name:'basic exterior',short_name:'Basic Exterior'},
    {id:2,name:'Exterior Wash',is_exterior_detail_level_2:false},
    {id:3,name:'Unrelated name',is_exterior_detail_level_2:true},
  ]});
  assert.doesNotMatch(text(renderer.toJSON()),/NOT RECOMMENDED/);
  assert.equal(renderer.root.findAllByType('Text').filter(n=>text(n)==='RECOMMENDED').length,1);await act(async()=>renderer.unmount());
});
test('no exterior catalog means no exterior notice',async()=>{
  const {renderer}=await section({exteriorServices:[],exteriorRecommendation:{show_recommendation:true,arrived_flights_count:19}});
  assert.doesNotMatch(text(renderer.toJSON()),/Exterior Service Recommendation/);await act(async()=>renderer.unmount());
});

for(const [role,user] of [
  ['admin',{isAdmin:true}],['coordinator',{isInternalCoordinator:true}],
  ['coordinator and PM',{isInternalCoordinator:true,isProjectManager:true}],
  ['customer',{isCustomer:true,customerId:77}],['job submitter',{isCustomer:true,customerId:77,is_job_submitter_only:true}],
]) test(`actual wizard validates first and uses correct customer for ${role}`,async()=>{
  const calls=[];
  const http={
    post:async(url,body)=>{calls.push([url,body]);return url==='/tail-exterior-level-2-checker'?{show_recommendation:true,arrived_flights_count:19}:{results:[]};},
    get:async(url)=>url.includes('retainers-services')?{services:[{id:1,name:'Basic Exterior',category:'E'}],retainer_services:[]}:{settings:{},results:[]},
  };
  const AuthContext=React.createContext({currentUser:user});
  const mocks={
    'react-native':{...native,FlatList:({ListHeaderComponent})=>ListHeaderComponent,KeyboardAvoidingView:'KeyboardAvoidingView',Pressable:'Pressable'},
    '@expo/vector-icons':{MaterialIcons:'MaterialIcons'},
    '@react-navigation/native':{useFocusEffect:()=>{}},
    'expo-router':{Link:'Link',useRouter:()=>({})},'lottie-react-native':'LottieView',
    'react-native-svg':{Svg:'Svg',Path:'Path'},
    'react-native-paper':{TextInput:'TextInput',Snackbar:'Snackbar',Portal:'Portal'},
    'react-native-safe-area-context':{SafeAreaView:'SafeAreaView',useSafeAreaInsets:()=>({bottom:0})},
    '../../services/httpService':http,'../services/httpService':http,'../../providers/AuthProvider':{AuthContext},
  };
  for(const name of ['DatePicker','AirportFeesAlert','FboFeesAlert','HoursOfOperationAlert','ModalDropdown','ImagePickerSection','PriorityRadioGroup'])mocks['../../components/'+name]=name;
  const screenModules=loader(mocks);
  const Screen=screenModules('app/(tabs)/create.tsx').default;
  const ScreenSection=screenModules('components/ServicesSection.tsx').default;
  let renderer;await act(async()=>{renderer=create(React.createElement(Screen));});
  const pressNext=()=>renderer.root.findAllByType('TouchableOpacity').find(n=>text(n)==='Next').props.onPress();
  await act(async()=>pressNext());
  assert.equal(calls.filter(([url])=>url==='/tail-exterior-level-2-checker').length,0);
  assert.equal(renderer.root.findByType('Snackbar').props.visible,true);
  await act(async()=>renderer.root.findAllByType('TextInput').find(n=>n.props.label==='Tail Number').props.onChangeText(' n123qa '));
  for(const [label,item] of [['Customer',{id:42,name:'Fictional'}],['Aircraft Type',{id:1}],['Airport',{id:1}],['FBO',{id:1}]]){
    const field=renderer.root.findAllByType('ModalDropdown').find(n=>n.props.label===label);
    if(field)await act(async()=>field.props.onChange(item));
  }
  await act(async()=>pressNext());
  const request=calls.find(([url])=>url==='/tail-exterior-level-2-checker');
  assert.equal(request[1].customer_id,user.customerId||42);assert.equal(request[1].tail_number,'N123QA');
  assert.equal(renderer.root.findByType(ScreenSection).props.exteriorRecommendation.show_recommendation,true);
  await act(async()=>renderer.unmount());
});
