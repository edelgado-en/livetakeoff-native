import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TouchableOpacity,
         StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { Svg, Path } from "react-native-svg";
import { Dropdown } from 'react-native-element-dropdown';

import httpService from '../../services/httpService';
import { AuthContext } from '../../providers/AuthProvider';

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

   const [customers, setCustomers] = useState([]);
   const [customerSelected, setCustomerSelected] = useState(null);
   const [customerSearchTerm, setCustomerSearchTerm] = useState("");

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

  const searchCustomers = async () => {
    try {
      const response = await httpService.post('/customers',{ name: customerSearchTerm });

      setCustomers(response.results);
    } catch (err) {
        console.error("Error fetching customers:", err);
    }
  };

  const handleCustomerSelectedChange = (item: any) => {
    setCustomerSelected(item);
  };

  return (
    <SafeAreaView style={styles.safe}>
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
                            step.status === "complete" && styles.completeText,
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
             </>   
            )}
        </View>
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
    paddingHorizontal: 16,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
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
    left: 24,
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
});