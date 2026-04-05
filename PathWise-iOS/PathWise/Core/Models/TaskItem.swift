import Foundation

struct TaskItem: Codable, Identifiable, Hashable {
    let id: String
    let userId: String
    let milestoneId: String?
    let title: String
    let description: String?
    var status: String
    let priority: String
    let category: String?
    let dueDate: String?
    let completedAt: String?
    let createdAt: String
    let aiGenerated: Bool?
}

struct TaskListResponse: Codable {
    let tasks: [TaskItem]
}

struct TaskResponse: Codable {
    let task: TaskItem
}

struct CreateTaskRequest: Codable {
    let userId: String
    let milestoneId: String?
    let title: String
    let description: String?
    let priority: String?
    let category: String?
    let dueDate: String?
}

struct UpdateTaskRequest: Codable {
    let taskId: String
    let status: String?
    let priority: String?
    let title: String?
    let description: String?
    let dueDate: String?
}

struct GenerateTasksRequest: Codable {
    let userId: String
    let milestoneId: String
    let targetRole: String
}

struct CustomGenerateTasksRequest: Codable {
    let userId: String
    let prompt: String
    let targetRole: String?
    let count: Int?
}

struct GenerateTasksResponse: Codable {
    let tasks: [TaskItem]
}
