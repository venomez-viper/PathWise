import Foundation
import Observation

@MainActor
@Observable
class TasksViewModel {
    let api: APIClient
    let userId: String

    var tasks: [TaskItem] = []
    var isLoading = false
    var error: String?
    var showCelebration = false
    var isDailyView = true
    var targetRole: String = ""
    var progressPercent: Int = 0

    var filteredTasks: [TaskItem] {
        tasks.filter { $0.status != "done" }
    }

    var completedTasks: [TaskItem] {
        tasks.filter { $0.status == "done" }
    }

    var allDailyDone: Bool {
        !filteredTasks.isEmpty ? false : !tasks.isEmpty
    }

    init(api: APIClient, userId: String) {
        self.api = api
        self.userId = userId
    }

    func load() async {
        isLoading = true
        defer { isLoading = false }
        do {
            let response: TaskListResponse = try await api.request(.listTasks(userId: userId))
            tasks = response.tasks
            let roadmapResp: RoadmapResponse = try await api.request(.getRoadmap(userId: userId))
            targetRole = roadmapResp.roadmap?.targetRole ?? ""
            progressPercent = roadmapResp.roadmap?.completionPercent ?? 0
        } catch {
            self.error = error.localizedDescription
        }
    }

    func updateStatus(taskId: String, newStatus: String) async {
        do {
            let _: TaskResponse = try await api.request(
                .updateTask(taskId: taskId),
                body: UpdateTaskRequest(taskId: taskId, status: newStatus, priority: nil, title: nil, description: nil, dueDate: nil)
            )
            if let idx = tasks.firstIndex(where: { $0.id == taskId }) {
                tasks[idx].status = newStatus
            }
            if newStatus == "done" && filteredTasks.isEmpty {
                showCelebration = true
            }
        } catch {
            self.error = error.localizedDescription
        }
    }
}
