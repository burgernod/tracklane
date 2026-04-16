import React, { useMemo, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    TextInput,
    Platform,
    Modal,
    Pressable,
} from 'react-native';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from 'expo-router';
import { DrawerActions } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
    DraxProvider,
    DraxView,
    DraxScrollView,
} from 'react-native-drax';

type TaskStatus = 'process' | 'review' | 'done';
type TaskPriority = 'low' | 'medium' | 'high';

interface Task {
    id: string;
    title: string;
    status: TaskStatus;
    deadline: string;
    priority: TaskPriority;
    project: string;
    assignee: string;
    description?: string;
}

interface ActivityItem {
    id: string;
    text: string;
    time: string;
}

const STATUS_META: Record<TaskStatus, { title: string; color: string }> = {
    process: { title: 'В процессе', color: '#4169E1' },
    review: { title: 'На рассмотрении', color: '#FACC15' },
    done: { title: 'Закончены', color: '#22C55E' },
};

const PRIORITY_META: Record<TaskPriority, { label: string; color: string }> = {
    low: { label: 'Низкий', color: '#94A3B8' },
    medium: { label: 'Средний', color: '#F59E0B' },
    high: { label: 'Высокий', color: '#EF4444' },
};

const FILTER_OPTIONS: Array<{ key: 'all' | TaskStatus; label: string }> = [
    { key: 'all', label: 'Все' },
    { key: 'process', label: 'В процессе' },
    { key: 'review', label: 'На рассмотрении' },
    { key: 'done', label: 'Закончены' },
];

const today = new Date('2026-04-15');

const formatDateLabel = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
    });
};

const isOverdue = (date: string, status: TaskStatus) => {
    if (status === 'done') return false;
    return new Date(date) < today;
};

const isToday = (date: string) => {
    const d = new Date(date);
    return d.toDateString() === today.toDateString();
};

const isThisWeek = (date: string) => {
    const d = new Date(date);
    const diff = d.getTime() - today.getTime();
    const days = diff / (1000 * 60 * 60 * 24);
    return days >= 0 && days <= 7;
};

interface TaskCardProps {
    item: Task;
    color: string;
    onPress: (task: Task) => void;
}

function TaskCard({ item, color, onPress }: TaskCardProps) {
    const priority = PRIORITY_META[item.priority];

    return (
        <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.9}>
            <View style={styles.taskRowContainer}>
                <View style={styles.taskTopRow}>
                    <View style={styles.dummyTaskRow}>
                        <View style={[styles.taskDot, { backgroundColor: color }]} />
                        <Text style={styles.taskText}>{item.title}</Text>
                    </View>

                    <MaterialCommunityIcons
                        name="drag-vertical"
                        size={20}
                        color="#666"
                        style={{ marginLeft: 8 }}
                    />
                </View>

                <View style={styles.taskMetaRow}>
                    <Text style={styles.taskMetaText}>{item.project}</Text>
                    <Text style={styles.taskMetaDivider}>•</Text>
                    <Text style={styles.taskMetaText}>до {formatDateLabel(item.deadline)}</Text>
                </View>

                <View style={styles.taskBottomRow}>
                    <View
                        style={[
                            styles.priorityBadge,
                            { backgroundColor: `${priority.color}18` },
                        ]}
                    >
                        <Text style={[styles.priorityText, { color: priority.color }]}>
                            {priority.label}
                        </Text>
                    </View>

                    <View style={styles.assigneeBadge}>
                        <Text style={styles.assigneeText}>{item.assignee}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

interface StatusChipProps {
    statusKey: TaskStatus;
    tasks: Task[];
    isExpanded: boolean;
    onToggle: () => void;
    onDropTask: (task: Task, newStatus: TaskStatus) => void;
    onTaskPress: (task: Task) => void;
}

function StatusChip({
                        statusKey,
                        tasks,
                        isExpanded,
                        onToggle,
                        onDropTask,
                        onTaskPress,
                    }: StatusChipProps) {
    const meta = STATUS_META[statusKey];

    return (
        <DraxView
            receptive
            onReceiveDragDrop={({ dragged: { payload } }) => {
                const task = payload as Task;
                onDropTask(task, statusKey);
            }}
            style={styles.chipWrapper}
            receivingStyle={styles.activeDropZoneWrapper}
            renderContent={() => (
                <>
                    <TouchableOpacity
                        style={[
                            styles.chip,
                            {
                                backgroundColor: meta.color,
                                borderBottomLeftRadius: isExpanded ? 6 : 30,
                                borderBottomRightRadius: isExpanded ? 6 : 30,
                            },
                        ]}
                        onPress={onToggle}
                        activeOpacity={0.9}
                    >
                        <View style={styles.chipLeft}>
                            <View style={styles.chipCountBox}>
                                <Text style={[styles.chipCountText, { color: meta.color }]}>
                                    {tasks.length}
                                </Text>
                            </View>
                            <Text style={styles.chipTitle}>{meta.title}</Text>
                        </View>

                        <Ionicons
                            name={isExpanded ? 'chevron-up' : 'chevron-down'}
                            size={20}
                            color="#FFF"
                        />
                    </TouchableOpacity>

                    {isExpanded && (
                        <View style={[styles.expandedContent, { borderColor: meta.color }]}>
                            {tasks.length === 0 ? (
                                <Text style={styles.emptyText}>Задач нет</Text>
                            ) : (
                                tasks.map((item) => (
                                    <DraxView
                                        key={item.id}
                                        draggable
                                        dragPayload={item}
                                        longPressDelay={120}
                                        draggingStyle={styles.draggingStyle}
                                        dragReleasedStyle={styles.dragReleasedStyle}
                                        hoverDraggingStyle={styles.hoverDraggingStyle}
                                        style={styles.draggableWrapper}
                                        renderContent={() => (
                                            <TaskCard
                                                item={item}
                                                color={meta.color}
                                                onPress={onTaskPress}
                                            />
                                        )}
                                    />
                                ))
                            )}
                        </View>
                    )}
                </>
            )}
        />
    );
}

export default function DashboardScreen() {
    const navigation = useNavigation();

    const [expandedStates, setExpandedStates] = useState({
        process: true,
        review: true,
        done: true,
    });

    const [tasks, setTasks] = useState<Task[]>([
        {
            id: '1',
            title: 'Дизайн главной страницы',
            status: 'process',
            deadline: '2026-04-15',
            priority: 'high',
            project: 'Аврора',
            assignee: 'Жансерик',
            description: 'Собрать главный экран с KPI и виджетами.',
        },
        {
            id: '2',
            title: 'Подготовка иллюстраций',
            status: 'process',
            deadline: '2026-04-18',
            priority: 'medium',
            project: 'Аврора',
            assignee: 'Айдана',
            description: 'Подготовить иконки и иллюстрации для онбординга.',
        },
        {
            id: '3',
            title: 'Ревью целевой страницы',
            status: 'review',
            deadline: '2026-04-16',
            priority: 'high',
            project: 'Спринт 5',
            assignee: 'Олжас',
            description: 'Проверить адаптив и текстовые блоки.',
        },
        {
            id: '4',
            title: 'Верстка хедера',
            status: 'done',
            deadline: '2026-04-13',
            priority: 'low',
            project: 'Аврора',
            assignee: 'Мади',
            description: 'Завершить навигацию и мобильное меню.',
        },
    ]);

    const [activities, setActivities] = useState<ActivityItem[]>([
        { id: 'a1', text: 'Айдана обновила иллюстрации', time: '09:10' },
        { id: 'a2', text: 'Олжас отправил задачу на review', time: '10:25' },
        { id: 'a3', text: 'Мади завершил верстку хедера', time: '11:40' },
    ]);

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const [newTask, setNewTask] = useState<Omit<Task, 'id'>>({
        title: '',
        status: 'process',
        deadline: '2026-04-20',
        priority: 'medium',
        project: 'Аврора',
        assignee: 'Жансерик',
        description: '',
    });

    const toggleChip = (key: keyof typeof expandedStates) => {
        setExpandedStates((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const addActivity = (text: string) => {
        setActivities((prev) => [
            {
                id: Date.now().toString(),
                text,
                time: new Date().toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
            },
            ...prev.slice(0, 4),
        ]);
    };

    const moveTaskToStatus = (task: Task, newStatus: TaskStatus) => {
        if (task.status === newStatus) return;

        setTasks((prev) =>
            prev.map((t) =>
                t.id === task.id ? { ...t, status: newStatus } : t
            )
        );

        addActivity(`Задача "${task.title}" перемещена в "${STATUS_META[newStatus].title}"`);
    };

    const createTask = () => {
        if (!newTask.title.trim()) return;

        const task: Task = {
            id: Date.now().toString(),
            ...newTask,
            title: newTask.title.trim(),
        };

        setTasks((prev) => [task, ...prev]);
        setIsCreateModalOpen(false);
        setNewTask({
            title: '',
            status: 'process',
            deadline: '2026-04-20',
            priority: 'medium',
            project: 'Аврора',
            assignee: 'Жансерик',
            description: '',
        });

        addActivity(`Создана новая задача "${task.title}"`);
    };

    const updateSelectedTask = (patch: Partial<Task>) => {
        if (!selectedTask) return;

        const updated = { ...selectedTask, ...patch };
        setSelectedTask(updated);

        setTasks((prev) =>
            prev.map((task) => (task.id === updated.id ? updated : task))
        );
    };

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch =
                task.title.toLowerCase().includes(search.toLowerCase()) ||
                task.project.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === 'all' ? true : task.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [tasks, search, statusFilter]);

    const processTasks = useMemo(
        () => filteredTasks.filter((task) => task.status === 'process'),
        [filteredTasks]
    );

    const reviewTasks = useMemo(
        () => filteredTasks.filter((task) => task.status === 'review'),
        [filteredTasks]
    );

    const doneTasks = useMemo(
        () => filteredTasks.filter((task) => task.status === 'done'),
        [filteredTasks]
    );

    const overdueCount = tasks.filter((task) => isOverdue(task.deadline, task.status)).length;
    const todayCount = tasks.filter((task) => isToday(task.deadline) && task.status !== 'done').length;
    const weekCount = tasks.filter((task) => isThisWeek(task.deadline) && task.status !== 'done').length;

    const projectStats = useMemo(() => {
        const grouped = tasks.reduce<Record<string, Task[]>>((acc, task) => {
            if (!acc[task.project]) acc[task.project] = [];
            acc[task.project].push(task);
            return acc;
        }, {});

        return Object.entries(grouped).map(([project, items]) => {
            const done = items.filter((task) => task.status === 'done').length;
            const progress = Math.round((done / items.length) * 100);

            return {
                project,
                total: items.length,
                done,
                progress,
            };
        });
    }, [tasks]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <DraxProvider>
                <SafeAreaView style={styles.container}>
                    <DraxScrollView
                        contentContainerStyle={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.header}>
                            <Text style={styles.headerTitle}>Дешборд</Text>

                            <View style={styles.headerActions}>
                                <TouchableOpacity
                                    style={styles.addButton}
                                    onPress={() => setIsCreateModalOpen(true)}
                                >
                                    <Ionicons name="add" size={20} color="#FFF" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                                >
                                    <Feather name="menu" size={28} color="#000" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.actionBar}>
                            <View style={styles.searchBox}>
                                <TextInput
                                    style={styles.searchInput}
                                    placeholder="Поиск задач или проекта"
                                    placeholderTextColor="#888"
                                    value={search}
                                    onChangeText={setSearch}
                                />
                                <Ionicons
                                    name="search"
                                    size={20}
                                    color="#888"
                                    style={styles.searchIcon}
                                />
                            </View>

                            <TouchableOpacity style={styles.calendarButton}>
                                <Ionicons name="calendar-outline" size={20} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.filterRow}>
                            {FILTER_OPTIONS.map((option) => {
                                const active = statusFilter === option.key;
                                return (
                                    <TouchableOpacity
                                        key={option.key}
                                        style={[
                                            styles.filterChip,
                                            active && styles.filterChipActive,
                                        ]}
                                        onPress={() => setStatusFilter(option.key)}
                                    >
                                        <Text
                                            style={[
                                                styles.filterChipText,
                                                active && styles.filterChipTextActive,
                                            ]}
                                        >
                                            {option.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        <View style={styles.statsRow}>
                            <View style={[styles.statCard, { borderColor: '#EF4444' }]}>
                                <Text style={styles.statValue}>{overdueCount}</Text>
                                <Text style={styles.statLabel}>Просрочено</Text>
                            </View>
                            <View style={[styles.statCard, { borderColor: '#4169E1' }]}>
                                <Text style={styles.statValue}>{todayCount}</Text>
                                <Text style={styles.statLabel}>На сегодня</Text>
                            </View>
                            <View style={[styles.statCard, { borderColor: '#22C55E' }]}>
                                <Text style={styles.statValue}>{weekCount}</Text>
                                <Text style={styles.statLabel}>На неделю</Text>
                            </View>
                        </View>

                        <StatusChip
                            statusKey="process"
                            tasks={processTasks}
                            isExpanded={expandedStates.process}
                            onToggle={() => toggleChip('process')}
                            onDropTask={moveTaskToStatus}
                            onTaskPress={setSelectedTask}
                        />

                        <StatusChip
                            statusKey="review"
                            tasks={reviewTasks}
                            isExpanded={expandedStates.review}
                            onToggle={() => toggleChip('review')}
                            onDropTask={moveTaskToStatus}
                            onTaskPress={setSelectedTask}
                        />

                        <StatusChip
                            statusKey="done"
                            tasks={doneTasks}
                            isExpanded={expandedStates.done}
                            onToggle={() => toggleChip('done')}
                            onDropTask={moveTaskToStatus}
                            onTaskPress={setSelectedTask}
                        />

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Мои проекты</Text>
                        </View>

                        {projectStats.map((project) => (
                            <View key={project.project} style={styles.projectCard}>
                                <View style={styles.projectCardLeft}>
                                    <View style={styles.projectIconDark}>
                                        <Ionicons name="rocket-outline" size={20} color="#FFF" />
                                    </View>

                                    <View>
                                        <Text style={styles.projectCardTitle}>{project.project}</Text>
                                        <Text style={styles.projectCardSubtitle}>
                                            {project.done}/{project.total} завершено
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.projectProgressWrap}>
                                    <Text style={styles.projectProgressText}>{project.progress}%</Text>
                                    <View style={styles.progressTrack}>
                                        <View
                                            style={[
                                                styles.progressFill,
                                                { width: `${project.progress}%` },
                                            ]}
                                        />
                                    </View>
                                </View>
                            </View>
                        ))}

                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Последняя активность</Text>
                        </View>

                        <View style={styles.activityBox}>
                            {activities.map((activity) => (
                                <View key={activity.id} style={styles.activityItem}>
                                    <View style={styles.activityDot} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.activityText}>{activity.text}</Text>
                                        <Text style={styles.activityTime}>{activity.time}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </DraxScrollView>

                    <Modal visible={isCreateModalOpen} transparent animationType="slide">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalCard}>
                                <Text style={styles.modalTitle}>Новая задача</Text>

                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Название"
                                    value={newTask.title}
                                    onChangeText={(text) =>
                                        setNewTask((prev) => ({ ...prev, title: text }))
                                    }
                                />
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Проект"
                                    value={newTask.project}
                                    onChangeText={(text) =>
                                        setNewTask((prev) => ({ ...prev, project: text }))
                                    }
                                />
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Исполнитель"
                                    value={newTask.assignee}
                                    onChangeText={(text) =>
                                        setNewTask((prev) => ({ ...prev, assignee: text }))
                                    }
                                />
                                <TextInput
                                    style={styles.modalInput}
                                    placeholder="Дедлайн YYYY-MM-DD"
                                    value={newTask.deadline}
                                    onChangeText={(text) =>
                                        setNewTask((prev) => ({ ...prev, deadline: text }))
                                    }
                                />
                                <TextInput
                                    style={[styles.modalInput, styles.modalTextarea]}
                                    placeholder="Описание"
                                    multiline
                                    value={newTask.description}
                                    onChangeText={(text) =>
                                        setNewTask((prev) => ({ ...prev, description: text }))
                                    }
                                />

                                <View style={styles.inlineOptionsRow}>
                                    {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => {
                                        const active = newTask.priority === p;
                                        return (
                                            <TouchableOpacity
                                                key={p}
                                                style={[
                                                    styles.optionChip,
                                                    active && styles.optionChipActive,
                                                ]}
                                                onPress={() =>
                                                    setNewTask((prev) => ({ ...prev, priority: p }))
                                                }
                                            >
                                                <Text style={styles.optionChipText}>
                                                    {PRIORITY_META[p].label}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                <View style={styles.inlineOptionsRow}>
                                    {(['process', 'review', 'done'] as TaskStatus[]).map((s) => {
                                        const active = newTask.status === s;
                                        return (
                                            <TouchableOpacity
                                                key={s}
                                                style={[
                                                    styles.optionChip,
                                                    active && styles.optionChipActive,
                                                ]}
                                                onPress={() =>
                                                    setNewTask((prev) => ({ ...prev, status: s }))
                                                }
                                            >
                                                <Text style={styles.optionChipText}>
                                                    {STATUS_META[s].title}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>

                                <View style={styles.modalActions}>
                                    <Pressable
                                        style={styles.modalSecondaryButton}
                                        onPress={() => setIsCreateModalOpen(false)}
                                    >
                                        <Text style={styles.modalSecondaryButtonText}>Отмена</Text>
                                    </Pressable>

                                    <Pressable
                                        style={styles.modalPrimaryButton}
                                        onPress={createTask}
                                    >
                                        <Text style={styles.modalPrimaryButtonText}>Создать</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    <Modal visible={!!selectedTask} transparent animationType="slide">
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalCard}>
                                <Text style={styles.modalTitle}>Карточка задачи</Text>

                                {selectedTask && (
                                    <>
                                        <TextInput
                                            style={styles.modalInput}
                                            value={selectedTask.title}
                                            onChangeText={(text) =>
                                                updateSelectedTask({ title: text })
                                            }
                                        />
                                        <TextInput
                                            style={styles.modalInput}
                                            value={selectedTask.project}
                                            onChangeText={(text) =>
                                                updateSelectedTask({ project: text })
                                            }
                                        />
                                        <TextInput
                                            style={styles.modalInput}
                                            value={selectedTask.assignee}
                                            onChangeText={(text) =>
                                                updateSelectedTask({ assignee: text })
                                            }
                                        />
                                        <TextInput
                                            style={styles.modalInput}
                                            value={selectedTask.deadline}
                                            onChangeText={(text) =>
                                                updateSelectedTask({ deadline: text })
                                            }
                                        />
                                        <TextInput
                                            style={[styles.modalInput, styles.modalTextarea]}
                                            multiline
                                            value={selectedTask.description}
                                            onChangeText={(text) =>
                                                updateSelectedTask({ description: text })
                                            }
                                        />

                                        <View style={styles.inlineOptionsRow}>
                                            {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => {
                                                const active = selectedTask.priority === p;
                                                return (
                                                    <TouchableOpacity
                                                        key={p}
                                                        style={[
                                                            styles.optionChip,
                                                            active && styles.optionChipActive,
                                                        ]}
                                                        onPress={() =>
                                                            updateSelectedTask({ priority: p })
                                                        }
                                                    >
                                                        <Text style={styles.optionChipText}>
                                                            {PRIORITY_META[p].label}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>

                                        <View style={styles.inlineOptionsRow}>
                                            {(['process', 'review', 'done'] as TaskStatus[]).map((s) => {
                                                const active = selectedTask.status === s;
                                                return (
                                                    <TouchableOpacity
                                                        key={s}
                                                        style={[
                                                            styles.optionChip,
                                                            active && styles.optionChipActive,
                                                        ]}
                                                        onPress={() =>
                                                            updateSelectedTask({ status: s })
                                                        }
                                                    >
                                                        <Text style={styles.optionChipText}>
                                                            {STATUS_META[s].title}
                                                        </Text>
                                                    </TouchableOpacity>
                                                );
                                            })}
                                        </View>
                                    </>
                                )}

                                <View style={styles.modalActions}>
                                    <Pressable
                                        style={styles.modalPrimaryButton}
                                        onPress={() => setSelectedTask(null)}
                                    >
                                        <Text style={styles.modalPrimaryButtonText}>Готово</Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </SafeAreaView>
            </DraxProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FAFAFA',
    },
    content: {
        padding: 20,
        paddingTop: Platform.OS === 'android' ? 40 : 10,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
    },
    headerActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    addButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#4169E1',
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionBar: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
        gap: 10,
    },
    searchBox: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 20,
        paddingHorizontal: 15,
        height: 42,
    },
    searchInput: {
        flex: 1,
        fontSize: 12,
    },
    searchIcon: {
        marginLeft: 5,
    },
    calendarButton: {
        backgroundColor: '#4169E1',
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 16,
        flexWrap: 'wrap',
    },
    filterChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    filterChipActive: {
        backgroundColor: '#111827',
        borderColor: '#111827',
    },
    filterChipText: {
        fontSize: 12,
        color: '#374151',
    },
    filterChipTextActive: {
        color: '#FFF',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#FFF',
        borderRadius: 18,
        borderWidth: 1,
        paddingVertical: 14,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    statLabel: {
        marginTop: 4,
        fontSize: 12,
        color: '#6B7280',
    },
    chipWrapper: {
        marginBottom: 15,
        borderRadius: 30,
    },
    activeDropZoneWrapper: {
        transform: [{ scale: 1.01 }],
        opacity: 0.96,
    },
    chip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
    },
    chipLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chipCountBox: {
        backgroundColor: '#FFF',
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    chipCountText: {
        fontWeight: 'bold',
        fontSize: 14,
    },
    chipTitle: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: '600',
    },
    expandedContent: {
        backgroundColor: '#FFF',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        borderWidth: 1,
        borderTopWidth: 0,
        padding: 15,
    },
    emptyText: {
        color: '#999',
        padding: 15,
        textAlign: 'center',
    },
    draggableWrapper: {
        marginBottom: 12,
    },
    draggingStyle: {
        opacity: 0.2,
    },
    dragReleasedStyle: {
        opacity: 1,
    },
    hoverDraggingStyle: {
        opacity: 0.7,
    },
    taskRowContainer: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#F1F5F9',
        borderRadius: 16,
        padding: 12,
    },
    taskTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dummyTaskRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 10,
    },
    taskDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 10,
    },
    taskText: {
        fontSize: 14,
        color: '#111827',
        flexShrink: 1,
        fontWeight: '600',
    },
    taskMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
    },
    taskMetaText: {
        fontSize: 12,
        color: '#6B7280',
    },
    taskMetaDivider: {
        marginHorizontal: 6,
        color: '#9CA3AF',
    },
    taskBottomRow: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priorityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    priorityText: {
        fontSize: 11,
        fontWeight: '600',
    },
    assigneeBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
    },
    assigneeText: {
        fontSize: 11,
        color: '#1D4ED8',
        fontWeight: '600',
    },
    sectionHeader: {
        marginTop: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        color: '#6B7280',
        fontSize: 14,
        fontWeight: '600',
    },
    projectCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#1A1A1A',
        borderRadius: 24,
        padding: 12,
        backgroundColor: '#FFF',
        marginBottom: 12,
    },
    projectCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    projectIconDark: {
        backgroundColor: '#1A1A1A',
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
    },
    projectCardTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1A1A1A',
    },
    projectCardSubtitle: {
        fontSize: 12,
        color: '#6B7280',
        marginTop: 2,
    },
    projectProgressWrap: {
        width: 90,
        alignItems: 'flex-end',
    },
    projectProgressText: {
        fontSize: 12,
        color: '#111827',
        fontWeight: '700',
        marginBottom: 6,
    },
    progressTrack: {
        width: '100%',
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 999,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4169E1',
        borderRadius: 999,
    },
    activityBox: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        marginBottom: 20,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
        marginBottom: 12,
    },
    activityDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4169E1',
        marginTop: 6,
    },
    activityText: {
        fontSize: 13,
        color: '#111827',
    },
    activityTime: {
        marginTop: 2,
        fontSize: 11,
        color: '#6B7280',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.35)',
        justifyContent: 'flex-end',
    },
    modalCard: {
        backgroundColor: '#FFF',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        maxHeight: '85%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 14,
    },
    modalInput: {
        height: 44,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 14,
        paddingHorizontal: 12,
        marginBottom: 10,
        color: '#111827',
    },
    modalTextarea: {
        height: 90,
        paddingTop: 12,
        textAlignVertical: 'top',
    },
    inlineOptionsRow: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
        marginBottom: 12,
    },
    optionChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 14,
        backgroundColor: '#F3F4F6',
    },
    optionChipActive: {
        backgroundColor: '#DBEAFE',
    },
    optionChipText: {
        fontSize: 12,
        color: '#111827',
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 10,
        marginTop: 10,
    },
    modalSecondaryButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: '#F3F4F6',
    },
    modalSecondaryButtonText: {
        color: '#111827',
        fontWeight: '600',
    },
    modalPrimaryButton: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: '#4169E1',
    },
    modalPrimaryButtonText: {
        color: '#FFF',
        fontWeight: '600',
    },
});