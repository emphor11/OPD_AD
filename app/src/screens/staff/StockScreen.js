import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Alert } from 'react-native';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { COLORS } from '../../utils/constants';

const INITIAL_STOCK = [
  { _id: 'm-1', name: 'Paracetamol 500mg', quantity: 240, unit: 'tablets', minLevel: 100 },
  { _id: 'm-2', name: 'Amoxicillin 250mg', quantity: 45, unit: 'strips', minLevel: 50 }, // low stock
  { _id: 'm-3', name: 'Normal Saline IV 500ml', quantity: 18, unit: 'bottles', minLevel: 25 }, // low stock
  { _id: 'm-4', name: 'Cetirizine 10mg', quantity: 180, unit: 'tablets', minLevel: 60 },
  { _id: 'm-5', name: 'Oxygen Cylinder Type D', quantity: 12, unit: 'units', minLevel: 8 },
];

export default function StockScreen({ navigation }) {
  const [stock, setStock] = useState(INITIAL_STOCK);

  const handleRestock = (item) => {
    Alert.alert('Restock Supply', `Add 50 units of ${item.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Add Stock',
        onPress: () => {
          setStock((prev) =>
            prev.map((s) => (s._id === item._id ? { ...s, quantity: s.quantity + 50 } : s))
          );
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const isLow = item.quantity < item.minLevel;

    return (
      <Card style={[styles.card, isLow && styles.lowStockCard]}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.threshold}>Minimum Safe Level: {item.minLevel} {item.unit}</Text>
          </View>
          {isLow ? (
            <View style={styles.lowBadge}>
              <Text style={styles.lowBadgeText}>⚠️ LOW STOCK</Text>
            </View>
          ) : (
            <View style={styles.okBadge}>
              <Text style={styles.okBadgeText}>IN STOCK</Text>
            </View>
          )}
        </View>

        <View style={styles.qtyRow}>
          <Text style={styles.qtyLabel}>Available Quantity:</Text>
          <Text style={[styles.qtyValue, isLow && styles.qtyLow]}>
            {item.quantity} {item.unit}
          </Text>
        </View>

        <View style={styles.actionRow}>
          <Button
            title="+ Restock"
            variant="outline"
            style={styles.restockBtn}
            textStyle={{ fontSize: 13 }}
            onPress={() => handleRestock(item)}
          />
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Top Action Header */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.topTitle}>Hospital Dispensary Stock</Text>
          <Text style={styles.topSub}>Track medicines & critical consumables</Text>
        </View>
        <Button
          title="💊 Dispense"
          variant="primary"
          style={styles.dispenseBtn}
          onPress={() => navigation.navigate('Dispense')}
        />
      </View>

      <FlatList
        data={stock}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  topSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  dispenseBtn: {
    height: 38,
    paddingHorizontal: 12,
    marginVertical: 0,
  },
  list: {
    padding: 14,
  },
  card: {
    marginBottom: 10,
    padding: 14,
  },
  lowStockCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.danger,
    backgroundColor: '#FFFDFD',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  threshold: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  lowBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  lowBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.danger,
  },
  okBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  okBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },
  qtyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  qtyLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  qtyValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  qtyLow: {
    color: COLORS.danger,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  restockBtn: {
    height: 34,
    paddingHorizontal: 12,
    marginVertical: 0,
  },
});
