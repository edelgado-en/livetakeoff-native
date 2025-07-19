import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity,
         StyleSheet, SafeAreaView, ScrollView,
          KeyboardAvoidingView, Platform } from 'react-native';
import { Svg, Path } from "react-native-svg";
import { Dropdown } from 'react-native-element-dropdown';
import { TextInput } from 'react-native-paper';

import httpService from '../../services/httpService';
import { AuthContext } from '../../providers/AuthProvider';

import DatePicker from '../../components/DatePicker';

const requestPriorities = [
  {
    id: "N",
    title: "NORMAL",
    description:
      "Regular cleaning requests aimed at improving the general appearance of the aircraft.",
    selected: true,
  },
  {
    id: "H",
    title: "HIGH",
    description:
      "Urgent cleaning requests that must be completed at the specified location within the specified time frame.",
    selected: false,
  },
];

const availableSteps = [
  { id: 1, name: "Job Details", status: "current", selected: true },
  { id: 2, name: "Services & Retainers", status: "upcoming", selected: false },
  {
    id: 3,
    name: "Additional Instructions",
    status: "upcoming",
    selected: false,
  },
];

export default function CreateJobScreen() {
   const { currentUser } = useContext(AuthContext);
   const [steps, setSteps] = useState(availableSteps);
   const isStepOneSelected = steps[0].selected;
   const isStepTwoSelected = steps[1].selected;
   const isStepThreeSelected = steps[2].selected;

   const [tailNumber, setTailNumber] = useState("");

   const [customers, setCustomers] = useState([]);
  
   const [aircraftTypes, setAircraftTypes] = useState([]);
   const [airports, setAirports] = useState([]);
   const [fbos, setFbos] = useState([]);
   const [allFbos, setAllFbos] = useState([]);
   
   const [customerSelected, setCustomerSelected] = useState(null);
   const [aircraftTypeSelected, setAircraftTypeSelected] = useState(null);
   const [airportSelected, setAirportSelected] = useState(null);
   const [fboSelected, setFboSelected] = useState(null);

    const [estimatedArrivalDate, setEstimatedArrivalDate] = useState(null);
    const [estimatedDepartureDate, setEstimatedDepartureDate] = useState(null);
    const [completeByDate, setCompleteByDate] = useState(null);

    const [customerSearchTerm, setCustomerSearchTerm] = useState("");
    const [aircraftSearchTerm, setAircraftSearchTerm] = useState("");
    const [airportSearchTerm, setAirportSearchTerm] = useState("");
    const [fboSearchTerm, setFboSearchTerm] = useState("");

    const [selectedPriority, setSelectedPriority] = useState(requestPriorities[0]);

    const [onSite, setOnSite] = useState(false);

    const [requestedBy, setRequestedBy] = useState("");

    const [interiorServices, setInteriorServices] = useState([]);
    const [exteriorServices, setExteriorServices] = useState([]);
    const [otherServices, setOtherServices] = useState([]);

    const [interiorRetainerServices, setInteriorRetainerServices] = useState([]);
    const [exteriorRetainerServices, setExteriorRetainerServices] = useState([]);
    const [otherRetainerServices, setOtherRetainerServices] = useState([]);

 useEffect(() => {
    const newSteps = [...steps];

    newSteps[0].selected = true;
    newSteps[0].status = "current";
    newSteps[1].status = "upcoming";
    newSteps[2].status = "upcoming";

    newSteps[1].selected = false;
    newSteps[2].selected = false;

    setSteps(newSteps);
  }, []);

  useEffect(() => {
    //Basic throttling
    let timeoutID = setTimeout(() => {
      searchCustomers();
    }, 500);

    return () => {
      clearTimeout(timeoutID);
    };
  }, [customerSearchTerm]);

  useEffect(() => {
    //Basic throttling
    let timeoutID = setTimeout(() => {
      searchAircraftTypes();
    }, 500);

    return () => {
      clearTimeout(timeoutID);
    };

  }, [aircraftSearchTerm])

    useEffect(() => {
        //Basic throttling
        let timeoutID = setTimeout(() => {
        searchAirports();
        }, 500);
    
        return () => {
        clearTimeout(timeoutID);
        };
    }, [airportSearchTerm]);

    useEffect(() => {
        //Basic throttling
        let timeoutID = setTimeout(() => {
        searchFbos();
        }, 500);
    
        return () => {
        clearTimeout(timeoutID);
        };
    }, [fboSearchTerm]);

  const searchCustomers = async () => {
    try {
      const response = await httpService.post('/customers',{ name: customerSearchTerm });

      setCustomers(response.results);
    } catch (err) {
        console.error("Error fetching customers:", err);
    }
  };

  const searchAircraftTypes = async () => {
    try {
      const response = await httpService.post('/aircraft-types', { name: aircraftSearchTerm });

      setAircraftTypes(response.results);
    } catch (err) {
        console.error("Error fetching aircraft types:", err);
    }
  }

  const searchAirports = async () => {
    try {
      const response = await httpService.post('/airports', { name: airportSearchTerm });

      setAirports(response.results);
    } catch (err) {
        console.error("Error fetching airports:", err);
    }
  }

  const searchFbos = async () => {
    try {
      const response = await httpService.post('/fbo-search', { name: fboSearchTerm });
        setFbos(response.results);
        setAllFbos(response.results);
    } catch (err) {
        console.error("Error fetching FBOs:", err);
    }
  }

    const getServicesAndRetainers = async (customerId: Number) => {
        try {
            const response = await httpService.get(`/customers/retainers-services/${customerId}/`);

            const interior: any[] = [];
            const exterior: any[] = [];
            const other: any[] = [];

            response.services.forEach((service: any) => {
                if (service.category === "I") {
                interior.push(service);
                } else if (service.category === "E") {
                exterior.push(service);
                } else {
                other.push(service);
                }
            });

            setInteriorServices(interior);
            setExteriorServices(exterior);
            setOtherServices(other);

            const interiorRetainer: any[] = [];
            const exteriorRetainer: any[] = [];
            const otherRetainer: any[] = [];

            response.retainer_services.forEach((retainerService: any) => {
                if (retainerService.category === "I") {
                interiorRetainer.push(retainerService);
                } else if (retainerService.category === "E") {
                exteriorRetainer.push(retainerService);
                } else {
                otherRetainer.push(retainerService);
                }
            });

            setInteriorRetainerServices(interiorRetainer);
            setExteriorRetainerServices(exteriorRetainer);
            setOtherRetainerServices(otherRetainer);
        
            
        } catch (err) {
            console.error("Error fetching services and retainers:", err);
        }
    };

  const handleCustomerSelectedChange = (item: any) => {
     setCustomerSelected(item);
     getServicesAndRetainers(item.id);
  };

  const handleAircraftTypeSelectedChange = (item: any) => {
    setAircraftTypeSelected(item);
  }
  
  const handleAirportSelectedChange = (item: any) => {
    setAirportSelected(item);
  }

  const handleFboSelectedChange = (item: any) => {
    setFboSelected(item);
  }

  const handleGoToNextStep = (currentStep) => {
    let selectedCustomer = customerSelected;
    if (currentUser.customerId) {
      selectedCustomer = {
        id: currentUser.customerId,
      };
    }

    if (currentStep.id === 1) {

    } else if (currentStep.id === 2) {

    }

    const newSteps = [...steps];

    newSteps[0].selected = false;
    newSteps[1].selected = false;
    newSteps[2].selected = false;

    if (currentStep.id === 1) {
      newSteps[1].selected = true;
      newSteps[1].status = "current";
      newSteps[0].status = "complete";
    } else if (currentStep.id === 2) {
      newSteps[2].selected = true;
      newSteps[2].status = "current";
      newSteps[1].status = "complete";
    }

    setSteps(newSteps);
  }

  const handleGotoPreviousStep = (currentStep) => {
    const newSteps = [...steps];

    newSteps[0].selected = false;
    newSteps[1].selected = false;
    newSteps[2].selected = false;

    if (currentStep.id === 2) {
      newSteps[0].selected = true;
      newSteps[0].status = "current";
      newSteps[1].status = "upcoming";
    } else if (currentStep.id === 3) {
      newSteps[1].selected = true;
      newSteps[1].status = "current";
      newSteps[2].status = "upcoming";
    }

    setSteps(newSteps);
  };

  return (
    <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ flex: 1 }}
        >
            <ScrollView
                contentContainerStyle={{ paddingBottom: 100 }}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.container}>
                    {steps.map((step, index) => (
                        <View key={step.name} style={styles.stepRow}>
                            <View style={styles.iconAndLine}>
                                {/* Circle */}
                                <View
                                    style={[
                                        styles.circle,
                                        step.status === "complete" && styles.completeCircle,
                                        step.status === "current" && styles.currentCircle,
                                        step.status === "upcoming" && styles.upcomingCircle,
                                    ]}
                                >
                                    <Text
                                        style={[
                                        styles.circleText,
                                        step.status === "complete" && styles.completeCheck,
                                        step.status === "current" && styles.currentText,
                                        step.status === "upcoming" && styles.upcomingText,
                                        ]}
                                    >
                                        {step.status === "complete" ? "✓" : step.id}
                                    </Text>
                                </View>

                                {/* Connector line */}
                                {index !== steps.length - 1 && (
                                    <View style={styles.lineContainer}>
                                        <Svg height="20" width="2" viewBox="0 0 2 20">
                                            <Path
                                                d="M1 0 V20"
                                                stroke="#D1D5DB"
                                                strokeWidth="2"
                                            />
                                        </Svg>
                                    </View>
                                )}
                            </View>

                            {/* Step Label */}
                            <TouchableOpacity style={styles.stepLabelContainer}>
                                <Text
                                style={[
                                    styles.stepLabel,
                                    step.status === "complete" && styles.completeText,
                                    step.status === "current" && styles.currentText,
                                    step.status === "upcoming" && styles.upcomingText,
                                ]}
                                >
                                {step.name}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    {isStepOneSelected && (
                    <>
                        <TextInput
                            label="Tail Number"
                            value={tailNumber}
                            onChangeText={(text) => setTailNumber(text.toUpperCase())}
                            mode="outlined"
                            activeOutlineColor="#3B82F6" // Tailwind blue-500
                            outlineColor="#D1D5DB"        // Tailwind gray-300
                            autoCapitalize="none"
                            style={{ marginBottom: 30 }}
                        />
                        <View>
                            <Text style={[styles.dropdownLabel]}>
                                Customer
                            </Text>
                            <Dropdown
                                style={styles.dropdown}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                data={customers}
                                search
                                maxHeight={300}
                                labelField="name"
                                valueField="id"
                                placeholder="Select customer"
                                searchPlaceholder="Search..."
                                value={customerSelected?.id}
                                onChange={handleCustomerSelectedChange}
                                onChangeText={(text) => setCustomerSearchTerm(text)}
                            />
                        </View>
                        <View style={{ marginTop: 30 }}>
                            <Text style={[styles.dropdownLabel]}>
                                Aircraft Type
                            </Text>
                            <Dropdown
                                style={styles.dropdown}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                data={aircraftTypes}
                                search
                                maxHeight={300}
                                labelField="name"
                                valueField="id"
                                placeholder="Select aircraft type"
                                searchPlaceholder="Search..."
                                value={aircraftTypeSelected?.id}
                                onChange={handleAircraftTypeSelectedChange}
                                onChangeText={(text) => setAircraftSearchTerm(text)}
                            />
                        </View>
                        <View style={{ marginTop: 30 }}>
                            <Text style={[styles.dropdownLabel]}>
                                Airport
                            </Text>
                            <Dropdown
                                style={styles.dropdown}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                data={airports}
                                search
                                maxHeight={300}
                                labelField="name"
                                valueField="id"
                                placeholder="Select airport"
                                searchPlaceholder="Search..."
                                value={airportSelected?.id}
                                onChange={handleAirportSelectedChange}
                                onChangeText={(text) => setAirportSearchTerm(text)}
                            />
                        </View>
                        <View style={{ marginTop: 30 }}>
                            <Text style={[styles.dropdownLabel]}>
                                FBO
                            </Text>
                            <Dropdown
                                style={styles.dropdown}
                                placeholderStyle={styles.placeholderStyle}
                                selectedTextStyle={styles.selectedTextStyle}
                                inputSearchStyle={styles.inputSearchStyle}
                                data={fbos}
                                search
                                maxHeight={300}
                                labelField="name"
                                valueField="id"
                                placeholder="Select FBO"
                                searchPlaceholder="Search..."
                                value={fboSelected?.id}
                                onChange={handleFboSelectedChange}
                                onChangeText={(text) => setFboSearchTerm(text)}
                            />
                        </View>

                        <DatePicker
                            label="Estimated Arrival"
                            value={estimatedArrivalDate}
                            onChange={setEstimatedArrivalDate}
                            showOnSiteToggle
                            onSiteValue={onSite}
                            onToggleOnSite={setOnSite}
                        /> 

                        <DatePicker
                            label="Estimated Departure"
                            value={estimatedDepartureDate}
                            onChange={setEstimatedDepartureDate}
                        />

                        <DatePicker
                            label="Complete By"
                            value={completeByDate}
                            onChange={setCompleteByDate}
                        />

                        <TouchableOpacity style={[styles.button, { marginTop: 40 }]}
                                 onPress={() => handleGoToNextStep(steps[0])}>
                            <Text style={styles.buttonText}>Next</Text>
                        </TouchableOpacity>

                    </>   
                    )}

                    {isStepTwoSelected && (
                        <>
                        <Text>Step 2</Text>
                        <View style={styles.buttonRow}>
                            {/* Back Button */}
                            <TouchableOpacity
                                style={[styles.rowButton, styles.cancelButton]}
                                onPress={() => handleGotoPreviousStep(steps[1])}
                            >
                                <Text style={[styles.rowButtonText, styles.cancelButtonText]}>Back</Text>
                            </TouchableOpacity>

                            {/* Next Button */}
                            <TouchableOpacity
                                style={[styles.rowButton, styles.nextButton]}
                                onPress={() => handleGoToNextStep(steps[1])}
                            >
                                <Text style={styles.rowButtonText}>Next</Text>
                            </TouchableOpacity>
                        </View>
                        </>
                    )}

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
 container: {
    marginTop: 24,
    marginBottom: 60,
    paddingHorizontal: 16,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  iconAndLine: {
    alignItems: "center",
    width: 40,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  completeCircle: {
    backgroundColor: "#DC2626", // red-600
    borderWidth: 0,
  },
  currentCircle: {
    borderColor: "#DC2626",
  },
  upcomingCircle: {
    borderColor: "#D1D5DB", // gray-300
  },
  circleText: {
    fontSize: 16,
    fontWeight: "600",
  },
  completeText: {
    color: "#6B7280",
  },
  completeCheck: {
    color: "#FFFFFF",
  },
  currentText: {
    color: "#DC2626",
  },
  upcomingText: {
    color: "#6B7280", // gray-500
  },
  lineContainer: {
    marginTop: 2,
    height: 5,
  },
  stepLabelContainer: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  stepLabel: {
    fontSize: 18,
    fontWeight: "500",
  },
  dropdownLabel: {
      //position: 'absolute',
      //left: 10,
      //top: -10,
      position: 'absolute',
    top: -10,
    left: 10,
    backgroundColor: 'white',
    paddingHorizontal: 4,
    fontSize: 14,
    color: '#6B7280', // Tailwind gray-500
    zIndex: 1,
    },
  dropdown: {
    height: 50,
    borderColor: '#9CA3AF',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: 'white',
  },
  placeholderStyle: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: '#111827',
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    borderRadius: 8,
  },
  labelTextStyle: {
    position: 'absolute',
    top: -10,
    left: 12,
    backgroundColor: 'white',
    paddingHorizontal: 4,
    fontSize: 14,
    color: '#6B7280', // Tailwind gray-500, similar to Paper's default
    zIndex: 1,
    },
    button: {
    backgroundColor: '#ef4444', // Tailwind's red-500
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  buttonText: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 12, // requires React Native 0.71+
  marginTop: 40,
},
rowButton: {
  flex: 1,
  paddingVertical: 10,
  paddingHorizontal: 14,
  borderRadius: 12,
  shadowColor: '#000',
  shadowOpacity: 0.1,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 4,
  elevation: 3,
  alignItems: 'center',
},

nextButton: {
  backgroundColor: '#ef4444', // red-500
},

cancelButton: {
  backgroundColor: '#ffffff',
  borderWidth: 1,
  borderColor: '#D1D5DB', // gray-300
},

rowButtonText: {
  color: '#ffffff',
  textAlign: 'center',
  fontSize: 16,
  fontWeight: '500',
},

cancelButtonText: {
  color: '#374151', // gray-700
},
});