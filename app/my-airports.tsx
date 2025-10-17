import {
  View,
  Text,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useContext, useCallback, use } from "react";
import { useRouter } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import httpService from "../services/httpService";

import { AuthContext } from "../providers/AuthProvider";

type Fbo = {
  id: number;
  name: string;
};

type Airport = {
  id: number;
  name: string;
  initials?: string;
  selected?: boolean;
  fbos?: Fbo[]; // loaded on demand
  fbosLoaded?: boolean; // to avoid re-fetching
};

export default function MyAirportsScreen() {
  const [loading, setLoading] = useState(false);

  const [airports, setAirports] = useState<Airport[]>([]);
  const [searchText, setSearchText] = useState("");
  const [totalAirports, setTotalAirports] = useState(0);
  const [availableFbos, setAvailableFbos] = useState([]);
  const [loadingAirportId, setLoadingAirportId] = useState<number | null>(null);

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      //Basic throttling
      let timeoutID = setTimeout(() => {
        searchAirports();
      }, 500);

      return () => {
        clearTimeout(timeoutID);
      };
    }, [searchText])
  );

  const searchAirports = async () => {
    setLoading(true);

    const request = {
      name: searchText,
    };

    try {
      const response = await httpService.post(
        `/airports?page=${1}&size=${200}`,
        request
      );

      // Normalize items (ensure flags reset)
      const normalized: Airport[] =
        (response.results || []).map((a: any) => ({
          id: a.id,
          name: a.name,
          initials: a.initials,
          selected: false,
          fbos: [],
          fbosLoaded: false,
        })) ?? [];

      setTotalAirports(response.count || normalized.length);
      setAirports(normalized);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch airports.");
    } finally {
      setLoading(false);
    }
  };

  const getAvailableFbos = async (airportId: number) => {
    //set the airportId to the selected airport
    setAirports(
      airports.map((airport) =>
        airport.id === airportId
          ? { ...airport, selected: !airport.selected }
          : airport
      )
    );

    try {
      const response = await httpService.get(
        `/airports/available-fbos/${airportId}/`
      );

      setAvailableFbos(response);
    } catch (err) {
      Alert.alert("Error", "Failed to fetch available FBOs.");
    }
  };

  const deSelectAirport = (airportId: number) => {
    setAvailableFbos([]);

    setAirports(
      airports.map((airport) =>
        airport.id === airportId ? { ...airport, selected: false } : airport
      )
    );
  };

  const toggleAirport = async (airport: Airport) => {
    setAirports((prev) =>
      prev.map((a) =>
        a.id === airport.id ? { ...a, selected: !a.selected } : a
      )
    );

    // If expanding and FBOs not loaded yet, fetch them
    if (!airport.selected && !airport.fbosLoaded) {
      setLoadingAirportId(airport.id);
      try {
        const response = await httpService.get(
          `/airports/available-fbos/${airport.id}/`
        );
        const fbos: Fbo[] = (response || []).map((f: any) => ({
          id: f.id,
          name: f.name,
        }));
        setAirports((prev) =>
          prev.map((a) =>
            a.id === airport.id ? { ...a, fbos, fbosLoaded: true } : a
          )
        );
      } catch (err) {
        Alert.alert("Error", "Failed to fetch available FBOs.");
        // Collapse if fetch failed
        setAirports((prev) =>
          prev.map((a) => (a.id === airport.id ? { ...a, selected: false } : a))
        );
      } finally {
        setLoadingAirportId(null);
      }
    }
  };

  const AirportCard = ({ item }: { item: Airport }) => {
    const expanded = item.selected;
    return (
      <View style={styles.card}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => toggleAirport(item)}
          style={styles.cardHeader}
        >
          <View style={{ flex: 1 }}>
            <Text style={styles.airportName} numberOfLines={1}>
              {item.name}
            </Text>
            {!!item.initials && (
              <Text style={styles.airportCode}>{item.initials}</Text>
            )}
          </View>

          <MaterialIcons
            name={expanded ? "keyboard-arrow-up" : "keyboard-arrow-down"}
            size={24}
            color="#6B7280"
            style={{ marginLeft: 8 }}
          />
        </TouchableOpacity>

        {expanded && (
          <View style={styles.fboContainer}>
            {item.fbosLoaded && item.fbos && item.fbos.length > 0 ? (
              item.fbos.map((fbo) => (
                <View key={fbo.id} style={styles.fboRow}>
                  <View style={styles.fboDot} />
                  <Text style={styles.fboText} numberOfLines={2}>
                    {fbo.name}
                  </Text>
                </View>
              ))
            ) : loadingAirportId === item.id ? (
              <View style={styles.fboLoadingRow}>
                <Text style={styles.fboLoadingText}>Loading FBOs…</Text>
              </View>
            ) : (
              <Text style={styles.fboEmptyText}>
                No FBOs found for this airport.
              </Text>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 10 }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backIcon}
          >
            <MaterialIcons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>My Airports</Text>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#6b7280"
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            placeholder="Search tails..."
            placeholderTextColor="#374151"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {loading
              ? "Loading…"
              : `${totalAirports} airport${totalAirports === 1 ? "" : "s"}`}
          </Text>
        </View>
        {/* Airport list */}
        <View style={{ gap: 12 }}>
          {airports.map((a) => (
            <AirportCard key={a.id} item={a} />
          ))}
          {!loading && airports.length === 0 && (
            <Text style={styles.emptyText}>No airports found.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6", // Tailwind gray-100
  },
  container: {
    padding: 20,
  },
  backIcon: {
    marginBottom: 16,
    borderRadius: 9999,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    backgroundColor: "#fff",
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF", // White
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827", // Tailwind gray-900
  },
  countRow: {
    marginTop: 6,
    marginBottom: 12,
  },
  countText: {
    fontSize: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  airportName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  airportCode: {
    marginTop: 2,
    fontSize: 13,
    color: "#6B7280",
  },

  /* FBO list (expanded) */
  fboContainer: {
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FAFAFA",
  },
  fboRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  fboDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#3B82F6",
    marginRight: 10,
  },
  fboText: {
    flex: 1,
    color: "#374151",
    fontSize: 14,
  },
  fboEmptyText: {
    color: "#9CA3AF",
    fontSize: 13,
  },
  fboLoadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  fboLoadingText: {
    color: "#6B7280",
    fontSize: 13,
  },

  emptyText: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
  },
});
