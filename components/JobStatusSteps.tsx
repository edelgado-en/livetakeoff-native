import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import httpService from '../services/httpService';

const JobStatusSteps = ({ jobId, jobCurrentStatus }) => {
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    const fetchSteps = async () => {
      try {
        const response = await httpService.get(`/jobs/activity/${jobId}/`);
        const statusActivities = response.results.filter((s) => s.activity_type === 'S');

        const isSubmitted = statusActivities.some((s) => s.status === 'U');
        const isAccepted = statusActivities.some((s) => s.status === 'A');
        const isAssigned = statusActivities.some((s) => s.status === 'S');
        const isWIP = statusActivities.some((s) => s.status === 'W');
        const isCompleted = statusActivities.some((s) => s.status === 'C');
        const isInvoiced = statusActivities.some((s) => s.status === 'I');

        let statusSteps = [
          { name: 'Confirmed', status: 'upcoming', selected: false },
          { name: 'Assigned', status: 'upcoming', selected: false },
          { name: 'WIP', status: 'upcoming', selected: false },
          { name: 'Completed', status: 'upcoming', selected: false },
          { name: 'Invoiced', status: 'upcoming', selected: false },
        ];

        if (isSubmitted) {
          statusSteps.unshift({ name: 'Submitted', status: 'complete', selected: false });
        }

        if (isInvoiced) {
          statusSteps = statusSteps.map((s) => ({ ...s, status: 'complete', selected: false }));
        } else if (isCompleted) {
          statusSteps = statusSteps.map((s, i) => (i < statusSteps.length - 1 ? { ...s, status: 'complete', selected: false } : s));
        } else if (isWIP) {
          statusSteps = statusSteps.map((s, i) => (i < statusSteps.length - 2 ? { ...s, status: 'complete', selected: false } : s));
          statusSteps = statusSteps.map((s) => (s.name === 'WIP' ? { ...s, status: 'current', selected: true } : s));
        } else if (
          isAssigned &&
          ['S', 'W', 'C', 'I'].includes(jobCurrentStatus)
        ) {
          statusSteps = statusSteps.map((s, i) => (i < statusSteps.length - 3 ? { ...s, status: 'complete', selected: false } : s));
        } else if (isAccepted) {
          statusSteps = statusSteps.map((s, i) => (i < statusSteps.length - 4 ? { ...s, status: 'complete', selected: false } : s));
        } else if (isSubmitted) {
          statusSteps = statusSteps.map((s, i) => (i < statusSteps.length - 5 ? { ...s, status: 'complete', selected: false } : s));
        }

        setSteps(statusSteps);
      } catch (err) {
        console.error('Error loading steps:', err);
      }
    };

    fetchSteps();
  }, [jobId, jobCurrentStatus]);

  return (
    <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      {steps.map((step, index) => (
        <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ alignItems: 'center' }}>
                {/* Circle */}
                <View
                style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor:
                    step.status === 'complete' ? '#10B981' : step.status === 'current' ? '#FFF' : '#D1D5DB',
                    borderWidth: 2,
                    borderColor: step.status === 'current' ? '#10B981' : 'transparent',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
                >
                {step.status === 'complete' && (
                    <Feather name="check" size={14} color="white" />
                )}
                </View>

                {/* Vertical line below, if not last */}
                {index !== steps.length - 1 && (
                <View
                    style={{
                    width: 2,
                    height: 15,
                    backgroundColor: '#D1D5DB',
                    marginTop: 2,
                    }}
                />
                )}
            </View>

            {/* Step label */}
            <Text
                style={{
                marginLeft: 12,
                marginTop: 2,
                fontSize: 14,
                color:
                    step.status === 'current'
                    ? '#10B981'
                    : step.status === 'complete'
                    ? '#000000'
                    : '#9CA3AF',
                fontWeight: step.status === 'current' ? '600' : '400',
                }}
            >
                {step.name}
            </Text>
        </View>
      ))}
    </View>
  );
};

export default JobStatusSteps;