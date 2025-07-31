import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Surface, Chip } from 'react-native-paper';
import { cropTextForDevice } from '../utils/textUtils';

const PriceBreakdown = ({ priceBreakdown, jobDetails, currentUser }) => {
  return (
    <Surface style={styles.card} elevation={1}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Price Breakdown</Text>
      </View>

      {!jobDetails.is_auto_priced && !currentUser.isProjectManager && (
        <View style={styles.row}>
          <Text style={styles.label}>Price (manually set):</Text>
          <Text style={styles.value}>
            ${jobDetails.price ? jobDetails.price.toLocaleString() : '0.00'}
          </Text>
        </View>
      )}

      {jobDetails.is_auto_priced && (
        <View style={styles.section}>
          <View style={styles.topRow}>
            <Text style={styles.aircraft}>{cropTextForDevice(priceBreakdown.aircraftType)}</Text>
            {!currentUser.isProjectManager && (
              <Text style={styles.priceListType}>{priceBreakdown.priceListType}</Text>
            )}
          </View>

          {/* Services */}
          <Text style={styles.subHeader}>Services</Text>
          {priceBreakdown.services?.map(service => (
            <View key={service.id} style={styles.itemRow}>
              <Text style={styles.itemName}>{cropTextForDevice(service.name, 40)}</Text>
              <Text style={styles.itemValue}>{service.price > 0 ? `$${service.price}` : 'TBD'}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>${priceBreakdown.servicesPrice}</Text>
          </View>

          {/* Discounts */}
          {(currentUser.isAdmin ||
            currentUser.isSuperUser ||
            currentUser.isAccountManager ||
            currentUser.isInternalCoordinator ||
            currentUser.isCustomer) && (
            <>
              {priceBreakdown.discounts?.length > 0 && (
                <>
                  <Text style={styles.subHeader}>Discounts Applied</Text>
                  {priceBreakdown.discounts.map(discount => (
                    <View key={discount.id} style={styles.itemRow}>
                      <Text style={styles.itemName}>
                        {discount.name === 'S' ? 'By Service' : ''}
                        {discount.name === 'A' ? 'By Airport' : ''}
                        {discount.name === 'G' ? 'General' : ''}
                      </Text>
                      <Text style={styles.itemValue}>
                        {discount.isPercentage ? (
                          <>
                            {discount.discount}% <Text style={styles.subValue}>(${discount.discount_dollar_amount})</Text>
                          </>
                        ) : (
                          <>${discount.discount}</>
                        )}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Subtotal</Text>
                    <Text style={styles.totalValue}>${priceBreakdown.discountedPrice}</Text>
                  </View>
                </>
              )}

              {/* Additional Fees */}
              {priceBreakdown.additionalFees?.length > 0 && (
                <>
                  <Text style={styles.subHeader}>Additional Fees Applied</Text>
                  {priceBreakdown.additionalFees.map(fee => (
                    <View key={fee.id} style={styles.itemRow}>
                      <Text style={styles.itemName}>
                        {fee.name === 'A' && 'Travel Fees'}
                        {fee.name === 'F' && 'FBO Fee'}
                        {fee.name === 'G' && 'General'}
                        {fee.name === 'V' && 'Vendor Price Difference'}
                        {fee.name === 'M' && 'Management Fees'}
                      </Text>
                      <Text style={styles.itemValue}>
                        {fee.isPercentage ? (
                          <>
                            {fee.fee}% <Text style={styles.subValue}>(${fee.additional_fee_dollar_amount})</Text>
                          </>
                        ) : (
                          <>${fee.name === 'M' ? fee.additional_fee_dollar_amount : fee.fee}</>
                        )}
                      </Text>
                    </View>
                  ))}
                </>
              )}

              <View style={styles.totalRowBottom}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={[styles.totalValue, { fontWeight: '500' }]}>${priceBreakdown.totalPrice}</Text>
              </View>
            </>
          )}
        </View>
      )}
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    padding: 0,
  },
  headerText: {
    fontWeight: '500',
    fontSize: 16,
    color: '#111827',
  },
  section: {
    padding: 0,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12
  },
  aircraft: {
    fontSize: 16,
    color: '#374151',
  },
  priceListType: {
    backgroundColor: '#E0F2FE',
    color: '#374151',
    fontSize: 14,
    padding: 4,
    paddingHorizontal: 8,
    borderRadius: 10
  },
  subHeader: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 5,
    color: '#374151',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB', // Tailwind's gray-300
  },
  itemName: {
    paddingRight: 8,
    flexShrink: 1,
    fontSize: 15
  },
  itemValue: {
    color: '#111827',
    textAlign: 'right',
  },
  subValue: {
    color: '#6B7280',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 12,
  },
  totalRowBottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: 16,
    paddingTop: 12,
  },
  totalLabel: {
    color: '#111827',
    fontWeight: '600',
    paddingRight: 8,
  },
  totalValue: {
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  label: {
    fontWeight: 'bold',
    color: '#111827',
  },
  value: {
    color: '#374151',
  },
});

export default PriceBreakdown;