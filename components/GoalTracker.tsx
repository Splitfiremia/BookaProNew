import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Target,
  Plus,
  Edit3,
  Check,
  X,
  TrendingUp,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react-native";

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  type: "revenue" | "appointments" | "clients" | "custom";
  period: "daily" | "weekly" | "monthly" | "yearly";
  deadline: string;
  description?: string;
}

interface GoalTrackerProps {
  goals: Goal[];
  onAddGoal?: (goal: Omit<Goal, "id">) => void;
  onUpdateGoal?: (id: string, updates: Partial<Goal>) => void;
  onDeleteGoal?: (id: string) => void;
}

export default function GoalTracker({
  goals,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
}: GoalTrackerProps) {
  const [isAddingGoal, setIsAddingGoal] = useState<boolean>(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState<Omit<Goal, "id">>({
    title: "",
    target: 0,
    current: 0,
    type: "revenue",
    period: "monthly",
    deadline: new Date().toISOString().split('T')[0],
    description: "",
  });
  
  const getGoalIcon = (type: Goal["type"]) => {
    switch (type) {
      case "revenue": return <DollarSign size={20} color="#10B981" />;
      case "appointments": return <Calendar size={20} color="#3B82F6" />;
      case "clients": return <Users size={20} color="#8B5CF6" />;
      default: return <Target size={20} color="#F59E0B" />;
    }
  };
  
  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return "#10B981";
    if (percentage >= 75) return "#3B82F6";
    if (percentage >= 50) return "#F59E0B";
    return "#EF4444";
  };
  
  const calculateProgress = (goal: Goal) => {
    return Math.min((goal.current / goal.target) * 100, 100);
  };
  
  const formatValue = (value: number, type: Goal["type"]) => {
    if (type === "revenue") {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };
  
  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const handleAddGoal = () => {
    if (!newGoal.title.trim() || newGoal.target <= 0) {
      const message = "Please fill in all required fields";
      if (Platform.OS === 'web') {
        console.log("Validation Error:", message);
      } else {
        Alert.alert("Validation Error", message);
      }
      return;
    }
    
    onAddGoal?.(newGoal);
    setNewGoal({
      title: "",
      target: 0,
      current: 0,
      type: "revenue",
      period: "monthly",
      deadline: new Date().toISOString().split('T')[0],
      description: "",
    });
    setIsAddingGoal(false);
  };
  
  const handleUpdateProgress = (goalId: string, newCurrent: number) => {
    onUpdateGoal?.(goalId, { current: newCurrent });
    setEditingGoal(null);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Goal Tracker</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddingGoal(true)}
        >
          <Plus size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      
      {/* Add New Goal Form */}
      {isAddingGoal && (
        <View style={styles.addGoalForm}>
          <Text style={styles.formTitle}>Add New Goal</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Goal title"
            placeholderTextColor="#9CA3AF"
            value={newGoal.title}
            onChangeText={(text) => setNewGoal({ ...newGoal, title: text })}
          />
          
          <View style={styles.formRow}>
            <View style={styles.formColumn}>
              <Text style={styles.inputLabel}>Target</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={newGoal.target.toString()}
                onChangeText={(text) => setNewGoal({ ...newGoal, target: parseInt(text) || 0 })}
              />
            </View>
            
            <View style={styles.formColumn}>
              <Text style={styles.inputLabel}>Type</Text>
              <View style={styles.typeSelector}>
                {["revenue", "appointments", "clients", "custom"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.typeButton,
                      newGoal.type === type && styles.typeButtonActive,
                    ]}
                    onPress={() => setNewGoal({ ...newGoal, type: type as Goal["type"] })}
                  >
                    <Text
                      style={[
                        styles.typeButtonText,
                        newGoal.type === type && styles.typeButtonTextActive,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
          
          <View style={styles.formActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setIsAddingGoal(false)}
            >
              <X size={16} color="#9CA3AF" />
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleAddGoal}
            >
              <Check size={16} color="#FFFFFF" />
              <Text style={styles.saveButtonText}>Add Goal</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* Goals List */}
      <View style={styles.goalsList}>
        {goals.map((goal) => {
          const progress = calculateProgress(goal);
          const daysRemaining = getDaysRemaining(goal.deadline);
          const isOverdue = daysRemaining < 0;
          const isEditing = editingGoal === goal.id;
          
          return (
            <View key={goal.id} style={styles.goalCard}>
              <LinearGradient
                colors={progress >= 100 ? ["#10B981", "#059669"] : ["#1F2937", "#374151"]}
                style={styles.goalGradient}
              >
                <View style={styles.goalHeader}>
                  <View style={styles.goalTitleRow}>
                    {getGoalIcon(goal.type)}
                    <Text style={styles.goalTitle}>{goal.title}</Text>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => setEditingGoal(isEditing ? null : goal.id)}
                    >
                      <Edit3 size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.goalMeta}>
                    <Text style={styles.goalPeriod}>{goal.period}</Text>
                    <Text style={[styles.goalDeadline, isOverdue && styles.overdue]}>
                      {isOverdue ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days left`}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.goalProgress}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressText}>
                      {formatValue(goal.current, goal.type)} / {formatValue(goal.target, goal.type)}
                    </Text>
                    <Text style={styles.progressPercentage}>
                      {progress.toFixed(1)}%
                    </Text>
                  </View>
                  
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${progress}%`,
                            backgroundColor: getProgressColor(progress),
                          },
                        ]}
                      />
                    </View>
                  </View>
                  
                  {progress >= 100 && (
                    <View style={styles.completedBadge}>
                      <Check size={16} color="#FFFFFF" />
                      <Text style={styles.completedText}>Goal Achieved!</Text>
                    </View>
                  )}
                </View>
                
                {/* Edit Progress */}
                {isEditing && (
                  <View style={styles.editProgress}>
                    <Text style={styles.editLabel}>Update Progress:</Text>
                    <View style={styles.editRow}>
                      <TextInput
                        style={styles.editInput}
                        placeholder={goal.current.toString()}
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        onSubmitEditing={(e) => {
                          const newValue = parseInt(e.nativeEvent.text) || 0;
                          handleUpdateProgress(goal.id, newValue);
                        }}
                      />
                      <TouchableOpacity
                        style={styles.updateButton}
                        onPress={() => setEditingGoal(null)}
                      >
                        <Check size={16} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </LinearGradient>
            </View>
          );
        })}
        
        {goals.length === 0 && !isAddingGoal && (
          <View style={styles.emptyState}>
            <Target size={48} color="#6B7280" />
            <Text style={styles.emptyTitle}>No Goals Set</Text>
            <Text style={styles.emptyDescription}>
              Set goals to track your progress and stay motivated!
            </Text>
            <TouchableOpacity
              style={styles.emptyAddButton}
              onPress={() => setIsAddingGoal(true)}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.emptyAddText}>Add Your First Goal</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1F2937",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  addGoalForm: {
    backgroundColor: "#374151",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#1F2937",
    borderRadius: 8,
    padding: 12,
    color: "#FFFFFF",
    fontSize: 16,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 8,
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  formColumn: {
    flex: 1,
  },
  typeSelector: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#1F2937",
  },
  typeButtonActive: {
    backgroundColor: "#3B82F6",
  },
  typeButtonText: {
    fontSize: 12,
    color: "#9CA3AF",
    textTransform: "capitalize",
  },
  typeButtonTextActive: {
    color: "#FFFFFF",
  },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#1F2937",
    gap: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    gap: 6,
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#FFFFFF",
  },
  goalsList: {
    gap: 12,
  },
  goalCard: {
    borderRadius: 12,
    overflow: "hidden",
  },
  goalGradient: {
    padding: 16,
  },
  goalHeader: {
    marginBottom: 16,
  },
  goalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  goalTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  editButton: {
    padding: 4,
  },
  goalMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  goalPeriod: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
    textTransform: "capitalize",
  },
  goalDeadline: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  overdue: {
    color: "#EF4444",
  },
  goalProgress: {
    gap: 8,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressText: {
    fontSize: 14,
    color: "#FFFFFF",
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  progressBarContainer: {
    marginVertical: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  completedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  completedText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#10B981",
  },
  editProgress: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.1)",
  },
  editLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.8)",
    marginBottom: 8,
  },
  editRow: {
    flexDirection: "row",
    gap: 8,
  },
  editInput: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 6,
    padding: 8,
    color: "#FFFFFF",
    fontSize: 14,
  },
  updateButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyAddButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3B82F6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emptyAddText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFFFFF",
  },
});