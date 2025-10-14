import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react-native';
import { COLORS, FONTS } from '@/constants/theme';
import { BookingRequest } from '@/providers/AppointmentProvider';

interface BulkActionModalProps {
  visible: boolean;
  onClose: () => void;
  selectedRequests: BookingRequest[];
  action: 'accept' | 'decline';
  onConfirm: () => void;
  isProcessing?: boolean;
}

export default function BulkActionModal({
  visible,
  onClose,
  selectedRequests,
  action,
  onConfirm,
  isProcessing = false,
}: BulkActionModalProps) {
  const actionColor = action === 'accept' ? COLORS.success : COLORS.error;
  const ActionIcon = action === 'accept' ? CheckCircle : XCircle;
  const actionText = action === 'accept' ? 'Accept' : 'Decline';
  const totalRevenue = selectedRequests.reduce((sum, req) => sum + req.price, 0);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <ActionIcon size={24} color={actionColor} />
              <Text style={styles.title}>
                {actionText} {selectedRequests.length} Request{selectedRequests.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.warningContainer}>
            <AlertCircle size={20} color={COLORS.warning} />
            <Text style={styles.warningText}>
              This action cannot be undone. Please review the requests below.
            </Text>
          </View>

          {action === 'accept' && (
            <View style={styles.revenueContainer}>
              <Text style={styles.revenueLabel}>Total Revenue</Text>
              <Text style={styles.revenueAmount}>${totalRevenue.toFixed(2)}</Text>
            </View>
          )}

          <ScrollView style={styles.requestsList} showsVerticalScrollIndicator={false}>
            {selectedRequests.map((request) => (
              <View key={request.id} style={styles.requestItem}>
                <View style={styles.requestInfo}>
                  <Text style={styles.clientName}>{request.clientName}</Text>
                  <Text style={styles.serviceName}>{request.serviceName}</Text>
                  <Text style={styles.requestTime}>
                    {new Date(request.date).toLocaleDateString()} at {request.time}
                  </Text>
                </View>
                <Text style={styles.requestPrice}>${request.price}</Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={isProcessing}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.button,
                styles.confirmButton,
                { backgroundColor: actionColor },
                isProcessing && styles.disabledButton,
              ]}
              onPress={onConfirm}
              disabled={isProcessing}
            >
              <ActionIcon size={18} color="#FFFFFF" />
              <Text style={styles.confirmButtonText}>
                {isProcessing ? 'Processing...' : `${actionText} All`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: FONTS.bold,
  },
  closeButton: {
    padding: 4,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    margin: 16,
    backgroundColor: 'rgba(242, 166, 13, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(242, 166, 13, 0.3)',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  revenueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  revenueLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  revenueAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.success,
    fontFamily: FONTS.bold,
  },
  requestsList: {
    maxHeight: 300,
    paddingHorizontal: 16,
  },
  requestItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: 'rgba(24, 22, 17, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  requestInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 14,
    color: '#f2a60d',
    marginBottom: 2,
  },
  requestTime: {
    fontSize: 12,
    color: '#FFFFFF',
    opacity: 0.6,
  },
  requestPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.success,
    marginLeft: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmButton: {
    borderColor: 'transparent',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
});
