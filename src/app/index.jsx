
import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Keyboard,
  Alert,
} from 'react-native';

export default function HomeScreen() {
  const [taskTitle, setTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('All');

  
    
  const addTask = () => {
    const title = taskTitle.trim();
    const date = dueDate.trim();

    if (!title) {
      Alert.alert('Missing task', 'Please enter a task name.');
      return;
    }

    const duplicateTask = tasks.some(
      (task) => task.title.toLowerCase() === title.toLowerCase()
    );

    if (duplicateTask) {
      Alert.alert('Duplicate task', 'This task already exists.');
      return;
    }

    if (date) {
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;

      if (!datePattern.test(date)) {
        Alert.alert(
          'Invalid date',
          'Please use YYYY-MM-DD format, such as 2026-10-23.'
        );
        return;
      }

      const [year, month, day] = date.split('-').map(Number);
      const parsedDate = new Date(year, month - 1, day);

      if (
        parsedDate.getFullYear() !== year ||
        parsedDate.getMonth() !== month - 1 ||
        parsedDate.getDate() !== day
      ) {
        Alert.alert('Invalid date', 'Please enter a valid calendar date.');
        return;
      }
    }

    const newTask = {
      id: `${Date.now()}-${Math.random()}`,
      title: title,
      dueDate: date,
      completed: false,
    };

    setTasks((currentTasks) => [newTask, ...currentTasks]);
    setTaskTitle('');
    setDueDate('');
    Keyboard.dismiss();
  };



  const toggleTask = (id) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  const deleteTask = (id) => {
    Alert.alert(
      'Delete task?',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () =>
            setTasks((currentTasks) =>
              currentTasks.filter((task) => task.id !== id)
            ),
        },
      ]
    );
  };

  const getReminder = (task) => {
    if (!task.dueDate || task.completed) return '';

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const due = new Date(`${task.dueDate}T00:00:00`);
    const difference = Math.round(
      (due.getTime() - today.getTime()) /
        (1000 * 60 * 60 * 24)
    );

    if (difference < 0) return 'OVERDUE';
    if (difference === 0) return 'DUE TODAY';
    if (difference === 1) return 'DUE TOMORROW';

    return `DUE IN ${difference} DAYS`;
  };

  const visibleTasks = tasks.filter((task) => {
    if (filter === 'Active') return !task.completed;
    if (filter === 'Completed') return task.completed;
    return true;
  });

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const activeCount = tasks.length - completedCount;

  const renderTask = ({ item }) => {
    const reminder = getReminder(item);

    return (
      <View style={styles.taskCard}>
        <TouchableOpacity
          style={[
            styles.checkCircle,
            item.completed && styles.checkedCircle,
          ]}
          onPress={() => toggleTask(item.id)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.completed }}
          accessibilityLabel={`Mark ${item.title} ${
            item.completed ? 'incomplete' : 'complete'
          }`}
        >
          <Text style={styles.checkText}>
            {item.completed ? '✓' : ''}
          </Text>
        </TouchableOpacity>

        <View style={styles.taskDetails}>
          <Text
            style={[
              styles.taskTitle,
              item.completed && styles.completedTitle,
            ]}
          >
            {item.title}
          </Text>

          {item.dueDate ? (
            <Text style={styles.dueDate}>
              Due: {item.dueDate}
            </Text>
          ) : (
            <Text style={styles.noDate}>No due date</Text>
          )}

          {reminder ? (
            <Text
              style={[
                styles.reminder,
                reminder === 'OVERDUE'
                  ? styles.overdue
                  : reminder === 'DUE TODAY'
                  ? styles.dueToday
                  : styles.upcoming,
              ]}
            >
              {reminder}
            </Text>
          ) : null}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteTask(item.id)}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.title}`}
        >
          <Text style={styles.deleteText}>Delete</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={visibleTasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <View>
                <Text style={styles.logo}>TaskMate</Text>
                <Text style={styles.subtitle}>
                  Make today count.
                </Text>
              </View>

              <View style={styles.headerIcon}>
                <Text style={styles.headerIconText}>✓</Text>
              </View>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryHeading}>
                Your progress
              </Text>

              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>
                    {tasks.length}
                  </Text>
                  <Text style={styles.summaryLabel}>Total</Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>
                    {activeCount}
                  </Text>
                  <Text style={styles.summaryLabel}>Active</Text>
                </View>

                <View style={styles.summaryItem}>
                  <Text style={styles.summaryNumber}>
                    {completedCount}
                  </Text>
                  <Text style={styles.summaryLabel}>
                    Completed
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>
              Add a new task
            </Text>

            <View style={styles.formCard}>
              <TextInput
                style={styles.input}
                placeholder="What do you need to do?"
                placeholderTextColor="#9297A5"
                value={taskTitle}
                onChangeText={setTaskTitle}
                returnKeyType="next"
                maxLength={120}
              />

              <TextInput
                style={styles.input}
                placeholder="Due date (YYYY-MM-DD)"
                placeholderTextColor="#9297A5"
                value={dueDate}
                onChangeText={setDueDate}
                keyboardType="numbers-and-punctuation"
                maxLength={10}
              />

              <TouchableOpacity
                style={styles.addButton}
                onPress={addTask}
                accessibilityRole="button"
              >
                <Text style={styles.addButtonText}>
                  + Add Task
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.tasksHeadingRow}>
              <Text style={styles.sectionTitle}>My tasks</Text>
              <Text style={styles.taskCount}>
                {visibleTasks.length} tasks
              </Text>
            </View>

            <View style={styles.filterRow}>
              {['All', 'Active', 'Completed'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.filterButton,
                    filter === item && styles.activeFilter,
                  ]}
                  onPress={() => setFilter(item)}
                >
                  <Text
                    style={[
                      styles.filterText,
                      filter === item && styles.activeFilterText,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyTitle}>
              Nothing here yet
            </Text>
            <Text style={styles.emptyDescription}>
              Add a task above and take one step toward your goals.
            </Text>
          </View>
        }
        ListFooterComponent={
          <Text style={styles.footer}>
            One task at a time. You got this!
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F7FB',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 22,
  },
  logo: {
    fontSize: 30,
    fontWeight: '800',
    color: '#5546D8',
  },
  subtitle: {
    color: '#74798A',
    fontSize: 14,
    marginTop: 4,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#5546D8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  summaryCard: {
    backgroundColor: '#5546D8',
    padding: 20,
    borderRadius: 22,
    marginBottom: 26,
  },
  summaryHeading: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 18,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
  },
  summaryNumber: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  summaryLabel: {
    color: '#E2DFFF',
    fontSize: 12,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#22243A',
    marginBottom: 13,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 15,
    marginBottom: 26,
    borderWidth: 1,
    borderColor: '#ECECF4',
  },
  input: {
    backgroundColor: '#F7F7FB',
    borderWidth: 1,
    borderColor: '#E8E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: '#22243A',
    marginBottom: 11,
  },
  addButton: {
    backgroundColor: '#5546D8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  tasksHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskCount: {
    color: '#74798A',
    fontSize: 13,
    marginBottom: 13,
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: '#EDEEF5',
  },
  activeFilter: {
    backgroundColor: '#5546D8',
  },
  filterText: {
    color: '#656A7B',
    fontWeight: '600',
    fontSize: 13,
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ECECF4',
  },
  checkCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#B8B6D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 11,
  },
  checkedCircle: {
    backgroundColor: '#5546D8',
    borderColor: '#5546D8',
  },
  checkText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#292B40',
  },
  completedTitle: {
    color: '#9699A7',
    textDecorationLine: 'line-through',
  },
  dueDate: {
    fontSize: 12,
    color: '#777C8D',
    marginTop: 5,
  },
  noDate: {
    fontSize: 12,
    color: '#A0A3AF',
    marginTop: 5,
  },
  reminder: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 6,
  },
  overdue: {
    color: '#D63F4D',
  },
  dueToday: {
    color: '#D97706',
  },
  upcoming: {
    color: '#5546D8',
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    marginLeft: 5,
  },
  deleteText: {
    color: '#D63F4D',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 35,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
  },
  emptyEmoji: {
    fontSize: 35,
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#292B40',
  },
  emptyDescription: {
    textAlign: 'center',
    color: '#777C8D',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
  },
  footer: {
    textAlign: 'center',
    color: '#9297A5',
    fontSize: 12,
    paddingVertical: 24,
  },
});
