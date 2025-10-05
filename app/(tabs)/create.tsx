import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import { useRouter } from "expo-router";
import { Svg, Path } from "react-native-svg";
import { TextInput, Snackbar, Portal } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import httpService from "../../services/httpService";
import { AuthContext } from "../../providers/AuthProvider";

import DatePicker from "../../components/DatePicker";
import AirportFeesAlert from "../../components/AirportFeesAlert";
import FboFeesAlert from "../../components/FboFeesAlert";
import HoursOfOperationAlert from "../../components/HoursOfOperationAlert";
import ModalDropdown from "../../components/ModalDropdown";
import ServicesSection from "../../components/ServicesSection";
import ImagePickerSection from "../../components/ImagePickerSection";
import PriorityRadioGroup from "../../components/PriorityRadioGroup";

import { formatForDjangoNY } from "../../utils/datetime";

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
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { currentUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [createJobMessage, setCreateJobMessage] = useState("");
  const [steps, setSteps] = useState(availableSteps);
  const isStepOneSelected = steps[0].selected;
  const isStepTwoSelected = steps[1].selected;
  const isStepThreeSelected = steps[2].selected;
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

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

  const [selectedPriority, setSelectedPriority] = useState(
    requestPriorities[0]
  );

  const [customerPurchaseOrder, setCustomerPurchaseOrder] = useState("");

  const [onSite, setOnSite] = useState(false);

  const [tags, setTags] = useState([]);
  const [isRequestPriorityEnabled, setIsRequestPriorityEnabled] =
    useState(false);

  const [requestedBy, setRequestedBy] = useState("");

  const [interiorServices, setInteriorServices] = useState([]);
  const [exteriorServices, setExteriorServices] = useState([]);
  const [otherServices, setOtherServices] = useState([]);

  const [hideAddonsServices, setHideAddonsServices] = useState(false);

  const [interiorRetainerServices, setInteriorRetainerServices] = useState([]);
  const [exteriorRetainerServices, setExteriorRetainerServices] = useState([]);
  const [otherRetainerServices, setOtherRetainerServices] = useState([]);

  const [airportFees, setAirportFees] = useState([]);
  const [fboFees, setFboFees] = useState([]);

  const [comment, setComment] = useState("");
  const [commentHeight, setCommentHeight] = useState(100);

  const [images, setImages] = useState<string[]>([]);

  const suppressSearchRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      return () => {
        // Reset local state here manually
        setTailNumber("");
        setCustomers([]);
        setAircraftTypes([]);
        setAirports([]);
        setFbos([]);
        setCustomerSelected(null);
        setAircraftTypeSelected(null);
        setAirportSelected(null);
        setFboSelected(null);
        setEstimatedArrivalDate(null);
        setEstimatedDepartureDate(null);
        setCompleteByDate(null);
        setCustomerSearchTerm("");
        setAircraftSearchTerm("");
        setAirportSearchTerm("");
        setFboSearchTerm("");
        setSelectedPriority(requestPriorities[0]);
        setOnSite(false);
        setRequestedBy("");
        setInteriorServices([]);
        setExteriorServices([]);
        setOtherServices([]);
        setInteriorRetainerServices([]);
        setExteriorRetainerServices([]);
        setOtherRetainerServices([]);
        setAirportFees([]);
        setFboFees([]);
        setComment("");
        setImages([]);
        setSteps(
          availableSteps.map((step) => ({
            ...step,
            status: step.id === 1 ? "current" : "upcoming",
            selected: step.id === 1,
          }))
        );
        setCreateJobMessage("");
        setShowSnackbar(false);
        setSnackbarMessage("");
        suppressSearchRef.current = false;
        setLoading(false);
        setCommentHeight(100);
        setIsRequestPriorityEnabled(false);
        setTags([]);
      };
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      const timeoutID = setTimeout(() => {
        getJobInfo();
      }, 500);

      return () => {
        clearTimeout(timeoutID);
      };
    }, [])
  );

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

  useFocusEffect(
    useCallback(() => {
      const timeoutID = setTimeout(() => {
        searchCustomers();
      }, 500);

      return () => {
        clearTimeout(timeoutID);
      };
    }, [customerSearchTerm])
  );

  useEffect(() => {
    //Basic throttling
    let timeoutID = setTimeout(() => {
      getTailLookups();
    }, 300);

    return () => {
      clearTimeout(timeoutID);
    };
  }, [tailNumber]);

  useFocusEffect(
    useCallback(() => {
      const timeoutID = setTimeout(() => {
        searchAircraftTypes();
      }, 500);

      return () => {
        clearTimeout(timeoutID);
      };
    }, [aircraftSearchTerm])
  );

  useFocusEffect(
    useCallback(() => {
      if (suppressSearchRef.current) {
        suppressSearchRef.current = false;
        return; // Skip search
      }

      //Basic throttling
      let timeoutID = setTimeout(() => {
        searchAirports();
      }, 500);

      return () => {
        clearTimeout(timeoutID);
      };
    }, [airportSearchTerm])
  );

  useFocusEffect(
    useCallback(() => {
      //Basic throttling
      let timeoutID = setTimeout(() => {
        searchFbos();
      }, 500);

      return () => {
        clearTimeout(timeoutID);
      };
    }, [fboSearchTerm])
  );

  const searchCustomers = async () => {
    try {
      const response = await httpService.post("/customers?page=1&size=50", {
        name: customerSearchTerm,
      });

      setCustomers(response.results);
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const searchAircraftTypes = async () => {
    try {
      const response = await httpService.post(
        "/aircraft-types?page=1&size=50",
        { name: aircraftSearchTerm }
      );

      setAircraftTypes(response.results);
    } catch (err) {
      console.error("Error fetching aircraft types:", err);
    }
  };

  const searchAirports = async () => {
    try {
      const response = await httpService.post("/airports?page=1&size=50", {
        name: airportSearchTerm,
      });

      setAirports(ensureSelectedIsIncluded(response.results));
    } catch (err) {
      console.error("Error fetching airports:", err);
    }
  };

  const ensureSelectedIsIncluded = (list) => {
    if (airportSelected && !list.some((a) => a.id === airportSelected.id)) {
      return [...list, airportSelected]; // ✅ keep it
    }
    return list;
  };

  const searchFbos = async () => {
    try {
      const response = await httpService.post("/fbo-search", {
        name: fboSearchTerm,
      });
      setFbos(response.results);
      setAllFbos(response.results);
    } catch (err) {
      console.error("Error fetching FBOs:", err);
    }
  };

  const searchFbosWithBody = async (request) => {
    try {
      const response = await httpService.post("/fbo-search", request);

      if (response.results.length > 0) {
        setFbos(response.results);
      } else {
        setFbos(allFbos);
      }
    } catch (err) {
      console.error("Error fetching FBOs:", err);
    }
  };

  const createJob = async () => {
    setLoading(true);

    let selectedServices = [];
    selectedServices = selectedServices.concat(
      interiorServices.filter((service) => service.selected === true)
    );
    selectedServices = selectedServices.concat(
      exteriorServices.filter((service) => service.selected === true)
    );
    selectedServices = selectedServices.concat(
      otherServices.filter((service) => service.selected === true)
    );

    let selectedCustomer = customerSelected;

    if (currentUser.customerId) {
      selectedCustomer = {
        id: currentUser.customerId,
      };
    }

    const selectedServiceIds = selectedServices.map((service) => service.id);

    const formData = new FormData();

    formData.append("tail_number", tailNumber);
    formData.append("customer_id", selectedCustomer.id);
    formData.append("aircraft_type_id", aircraftTypeSelected.id);
    formData.append("airport_id", airportSelected.id);
    formData.append("fbo_id", fboSelected.id);

    if (estimatedArrivalDate instanceof Date) {
      console.log(
        "Estimated Arrival Date:",
        formatForDjangoNY(estimatedArrivalDate)
      );

      formData.append(
        "estimated_arrival_date",
        formatForDjangoNY(estimatedArrivalDate)
      );
    } else {
      formData.append("estimated_arrival_date", "null");
    }

    if (estimatedDepartureDate instanceof Date) {
      formData.append(
        "estimated_departure_date",
        formatForDjangoNY(estimatedDepartureDate)
      );
    } else {
      formData.append("estimated_departure_date", "null");
    }

    if (completeByDate instanceof Date) {
      formData.append("complete_by_date", formatForDjangoNY(completeByDate));
    } else {
      formData.append("complete_by_date", "null");
    }

    formData.append("services", selectedServiceIds);
    formData.append("retainer_services", []);
    formData.append("tags", []);
    formData.append("comment", comment);
    formData.append("on_site", onSite);
    formData.append("requested_by", requestedBy);
    formData.append("customer_purchase_order", customerPurchaseOrder);
    formData.append("priority", selectedPriority.id);
    formData.append("follower_emails", "");
    formData.append("ident", "");

    for (const uri of images) {
      const filename = uri.split("/").pop() || "photo.jpg";
      const match = /\.(\w+)$/.exec(filename || "");
      const type = match ? `image/${match[1]}` : `image`;

      formData.append("image", {
        uri,
        name: filename,
        type,
      } as any);
    }

    try {
      await httpService.post("/jobs/create", formData);

      setLoading(false);

      router.replace("/job-success");
    } catch (error) {
      setLoading(false);
      Alert.alert(
        "Error",
        "There was an error creating the job. Please try again later.",
        [{ text: "OK" }]
      );
    }
  };

  const searchAirportCustomerFees = async (request) => {
    try {
      const response = await httpService.post(
        "/airports/customer-fees",
        request
      );
      setAirportFees(response);
    } catch (err) {
      //ignore
    }
  };

  const searchFboCustomerFees = async (request) => {
    try {
      const response = await httpService.post("/fbos/customer-fees", request);
      setFboFees(response);
    } catch (err) {
      //ignore
    }
  };

  const getServicesAndRetainers = async (customerId: Number) => {
    try {
      const response = await httpService.get(
        `/customers/retainers-services/${customerId}/`
      );

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

    fetchCustomerDetails(item.id)
      .then((customerDetails) => {
        if (customerDetails) {
          setIsRequestPriorityEnabled(
            customerDetails.settings.enable_request_priority
          );
          setHideAddonsServices(customerDetails.settings.hide_addons_services);
        }
      })
      .catch((error) => {
        console.error("Error fetching customer details:", error);
      });

    if (currentUser.showAirportFees && airportSelected) {
      const request = {
        airport_id: airportSelected.id,
        customer_id: item.id,
      };

      searchAirportCustomerFees(request);
    }

    if (currentUser.showAirportFees && fboSelected) {
      const request = {
        fbo_id: fboSelected.id,
        customer_id: item.id,
      };

      searchFboCustomerFees(request);
    }
  };

  const handleAircraftTypeSelectedChange = (item: any) => {
    setAircraftTypeSelected(item);
  };

  const handleAirportSelectedChange = (item: any) => {
    setAirportSelected(item);
    setAirportSearchTerm("");
    searchFbosWithBody({ airport_id: item.id });

    let customer_id = null;

    if (currentUser.customerId) {
      customer_id = currentUser.customerId;
    } else if (customerSelected) {
      customer_id = customerSelected.id;
    }

    if (currentUser.showAirportFees && customer_id) {
      searchAirportCustomerFees({
        airport_id: item.id,
        customer_id: customer_id,
      });
    }
  };

  const handleFboSelectedChange = (item: any) => {
    setFboSelected(item);

    let customer_id = null;

    if (currentUser.customerId) {
      customer_id = currentUser.customerId;
    } else if (customerSelected) {
      customer_id = customerSelected.id;
    }

    if (currentUser.showAirportFees && customer_id) {
      const request = {
        fbo_id: item.id,
        customer_id: customer_id,
      };

      searchFboCustomerFees(request);
    }
  };

  const getJobInfo = async () => {
    try {
      const response = await httpService.get("/jobs/form-info");
      setTags(response.tags);

      if (response.customer_id) {
        getServicesAndRetainers(response.customer_id);
        setIsRequestPriorityEnabled(response.is_enable_request_priority);
        setHideAddonsServices(response.hide_addons_services);
      }
    } catch (error) {
      console.error("Error fetching job info:", error);
    }
  };

  const getTailLookups = async () => {
    if (tailNumber?.length > 2) {
      try {
        const response = await httpService.get(
          `/tail-aircraft-lookup/${tailNumber}/`
        );

        if (response) {
          setAircraftTypeSelected({
            id: response.aircraft_id,
            name: response.aircraft_name,
          });
          setAircraftSearchTerm(response.aircraft_name);

          if (
            currentUser.isAdmin ||
            currentUser.isSuperUser ||
            currentUser.isAccountManager ||
            currentUser.isInternalCoordinator
          ) {
            getServicesAndRetainers(response.customer_id);

            setCustomerSelected({
              id: response.customer_id,
              name: response.customer_name,
            });

            setCustomerSearchTerm(response.customer_name);

            const response1 = await httpService.get(
              `/customers/${response.customer_id}/`
            );

            setIsRequestPriorityEnabled(
              response1.settings.enable_request_priority
            );
            setHideAddonsServices(response1.settings.hide_addons_services);
          }
        }
      } catch (error) {
        console.error("Error fetching tail lookups:", error);
      }
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await httpService.get(`/customers/${customerId}/`);

      return response;
    } catch (error) {
      console.error("Error fetching customer details:", error);
    }

    return null;
  };

  const handleGoToNextStep = (currentStep) => {
    let selectedCustomer = customerSelected;
    if (currentUser.customerId) {
      selectedCustomer = {
        id: currentUser.customerId,
      };
    }

    if (currentStep.id === 1) {
      if (!tailNumber) {
        setShowSnackbar(true);
        setSnackbarMessage("Please enter a tail number.");
        return;
      }

      if (!selectedCustomer) {
        setShowSnackbar(true);
        setSnackbarMessage("Customer is required.");
        return;
      }

      if (!aircraftTypeSelected) {
        setShowSnackbar(true);
        setSnackbarMessage("Aircraft type is required.");
        return;
      }

      if (!airportSelected) {
        setShowSnackbar(true);
        setSnackbarMessage("Airport is required.");
        return;
      }

      if (!fboSelected) {
        setShowSnackbar(true);
        setSnackbarMessage("FBO is required.");
        return;
      }

      if (currentUser.promptRequestedBy && requestedBy.length === 0) {
        setShowSnackbar(true);
        setSnackbarMessage("Enter your name and email in requested by.");
        return;
      }
    } else if (currentStep.id === 2) {
      let selectedServices = [];

      selectedServices = selectedServices.concat(
        interiorServices.filter((service) => service.selected === true)
      );

      selectedServices = selectedServices.concat(
        exteriorServices.filter((service) => service.selected === true)
      );

      selectedServices = selectedServices.concat(
        otherServices.filter((service) => service.selected === true)
      );

      if (selectedServices.length === 0) {
        setShowSnackbar(true);
        setSnackbarMessage("Select at least one service.");
        return;
      }
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
  };

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

  const handleServiceChange = (service) => {
    if (service.category === "I") {
      const interiorServicesUpdated = interiorServices.map((el) => {
        if (el.id === service.id) {
          el.selected = !el.selected;
        }
        return el;
      });

      setInteriorServices(interiorServicesUpdated);
    } else if (service.category === "E") {
      const exteriorServicesUpdated = exteriorServices.map((el) => {
        if (el.id === service.id) {
          el.selected = !el.selected;
        }
        return el;
      });

      setExteriorServices(exteriorServicesUpdated);
    } else {
      const otherServicesUpdated = otherServices.map((el) => {
        if (el.id === service.id) {
          el.selected = !el.selected;
        }
        return el;
      });

      setOtherServices(otherServicesUpdated);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("../../assets/animations/progress-bar.json")}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
      </View>
    );
  }

  if (!currentUser) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <Portal>
        <Snackbar
          visible={showSnackbar}
          onDismiss={() => setShowSnackbar(false)}
          /* style={{ marginBottom: insets.bottom + 16, marginHorizontal: 16 }} */
          style={{
            marginBottom: insets.bottom + 14,
            marginHorizontal: 14,
            backgroundColor: "#ef4444", // Tailwind red-500
            borderRadius: 12,
          }}
          action={{
            label: "",
            icon: "close",
            onPress: () => setShowSnackbar(false),
          }}
        >
          {snackbarMessage}
        </Snackbar>
      </Portal>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <FlatList
          contentContainerStyle={{ paddingBottom: 120 }}
          ListHeaderComponent={
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
                          <Path d="M1 0 V20" stroke="#D1D5DB" strokeWidth="2" />
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
                    outlineColor="#D1D5DB" // Tailwind gray-300
                    autoCapitalize="none"
                    style={{ backgroundColor: "white" }}
                  />

                  {!currentUser.isCustomer && (
                    <ModalDropdown
                      label="Customer"
                      data={customers}
                      value={customerSelected?.id}
                      onChange={handleCustomerSelectedChange}
                      searchTerm={customerSearchTerm}
                      onSearchTermChange={setCustomerSearchTerm}
                    />
                  )}

                  {isRequestPriorityEnabled && (
                    <PriorityRadioGroup
                      requestPriorities={requestPriorities}
                      selectedPriority={selectedPriority}
                      onChange={setSelectedPriority}
                    />
                  )}

                  <ModalDropdown
                    label="Aircraft Type"
                    data={aircraftTypes}
                    value={aircraftTypeSelected?.id}
                    onChange={handleAircraftTypeSelectedChange}
                    searchTerm={aircraftSearchTerm}
                    onSearchTermChange={setAircraftSearchTerm}
                  />
                  <ModalDropdown
                    label="Airport"
                    data={airports}
                    value={airportSelected?.id}
                    onChange={handleAirportSelectedChange}
                    searchTerm={airportSearchTerm}
                    onSearchTermChange={setAirportSearchTerm}
                  />

                  {airportFees.length > 0 && (
                    <AirportFeesAlert airportFees={airportFees} />
                  )}

                  <ModalDropdown
                    label="FBO"
                    data={fbos}
                    value={fboSelected?.id}
                    onChange={handleFboSelectedChange}
                    searchTerm={fboSearchTerm}
                    onSearchTermChange={setFboSearchTerm}
                  />

                  {fboFees.length > 0 && <FboFeesAlert fboFees={fboFees} />}

                  {fboSelected && fboSelected.hours_of_operation && (
                    <HoursOfOperationAlert
                      hours_of_operation={fboSelected.hours_of_operation}
                    />
                  )}

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

                  {!currentUser.isCustomer && (
                    <DatePicker
                      label="Complete By"
                      value={completeByDate}
                      onChange={setCompleteByDate}
                    />
                  )}

                  {!currentUser.isCustomer && (
                    <TextInput
                      label="Customer Purchase Order"
                      value={customerPurchaseOrder}
                      onChangeText={(text) => setCustomerPurchaseOrder(text)}
                      style={{ marginTop: 20, backgroundColor: "white" }}
                      mode="outlined"
                      activeOutlineColor="#3B82F6" // Tailwind blue-500
                      outlineColor="#D1D5DB" // Tailwind gray-300
                    />
                  )}

                  {(!currentUser.isCustomer ||
                    currentUser.promptRequestedBy) && (
                    <TextInput
                      label="Requested By"
                      value={requestedBy}
                      placeholder="Enter your name and email address"
                      onChangeText={(text) => setRequestedBy(text)}
                      style={{ marginTop: 20, backgroundColor: "white" }}
                      mode="outlined"
                      activeOutlineColor="#3B82F6" // Tailwind blue-500
                      outlineColor="#D1D5DB" // Tailwind gray-300
                    />
                  )}

                  <TouchableOpacity
                    style={[styles.button, { marginTop: 50 }]}
                    onPress={() => handleGoToNextStep(steps[0])}
                  >
                    <Text style={styles.buttonText}>Next</Text>
                  </TouchableOpacity>
                </>
              )}

              {isStepTwoSelected && (
                <>
                  <ServicesSection
                    interiorServices={interiorServices}
                    exteriorServices={exteriorServices}
                    otherServices={otherServices}
                    onToggleService={handleServiceChange}
                    hideAddonsServices={hideAddonsServices}
                    currentUser={currentUser}
                  />

                  <View style={styles.buttonRow}>
                    {/* Back Button */}
                    <TouchableOpacity
                      style={[styles.rowButton, styles.cancelButton]}
                      onPress={() => handleGotoPreviousStep(steps[1])}
                    >
                      <Text
                        style={[styles.rowButtonText, styles.cancelButtonText]}
                      >
                        Back
                      </Text>
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

              {isStepThreeSelected && (
                <>
                  <TextInput
                    label="Add Notes"
                    placeholder="Specify any special instructions..."
                    multiline
                    mode="outlined"
                    value={comment}
                    onChangeText={setComment}
                    onContentSizeChange={(e) => {
                      const newHeight = e.nativeEvent.contentSize.height;
                      setCommentHeight(Math.max(100, newHeight)); // min height
                    }}
                    style={{
                      backgroundColor: "#fff",
                      fontSize: 16,
                      marginTop: 8,
                      borderRadius: 12,
                      height: commentHeight,
                      paddingHorizontal: 12,
                    }}
                    theme={{
                      colors: {
                        primary: "#ef4444",
                        outline: "#D1D5DB",
                        onSurfaceVariant: "#374151",
                      },
                      roundness: 12,
                    }}
                    textColor="#374151"
                  />

                  <ImagePickerSection images={images} setImages={setImages} />

                  <View style={styles.buttonRow}>
                    {/* Back Button */}
                    <TouchableOpacity
                      style={[styles.rowButton, styles.cancelButton]}
                      onPress={() => handleGotoPreviousStep(steps[2])}
                    >
                      <Text
                        style={[styles.rowButtonText, styles.cancelButtonText]}
                      >
                        Back
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.rowButton, styles.nextButton]}
                      onPress={createJob}
                    >
                      <Text style={styles.rowButtonText}>Create Job</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          }
          data={[]}
          renderItem={() => null}
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    marginTop: 24,
    marginBottom: 60,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff", // or 'rgba(255,255,255,0.9)' for overlay effect
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
    position: "absolute",
    top: -10,
    left: 10,
    backgroundColor: "white",
    paddingHorizontal: 4,
    fontSize: 14,
    color: "#6B7280", // Tailwind gray-500
    zIndex: 1,
  },
  dropdown: {
    height: 50,
    borderColor: "#9CA3AF",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    backgroundColor: "white",
  },
  placeholderStyle: {
    fontSize: 16,
    color: "#9CA3AF",
  },
  selectedTextStyle: {
    fontSize: 16,
    color: "#111827",
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    borderRadius: 8,
    borderColor: "#9CA3AF",
  },
  labelTextStyle: {
    position: "absolute",
    top: -10,
    left: 12,
    backgroundColor: "white",
    paddingHorizontal: 4,
    fontSize: 14,
    color: "#6B7280", // Tailwind gray-500, similar to Paper's default
    zIndex: 1,
  },
  button: {
    backgroundColor: "#ef4444", // Tailwind's red-500
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  buttonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12, // requires React Native 0.71+
    marginTop: 40,
  },
  rowButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
  },

  nextButton: {
    backgroundColor: "#ef4444", // red-500
  },

  cancelButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#D1D5DB", // gray-300
  },

  rowButtonText: {
    color: "#ffffff",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "500",
  },

  cancelButtonText: {
    color: "#374151", // gray-700
  },
});
