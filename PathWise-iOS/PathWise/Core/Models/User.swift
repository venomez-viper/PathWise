import Foundation

struct User: Codable, Identifiable, Sendable {
    let id: String
    var name: String
    var email: String
    var avatarUrl: String?
    var plan: String
}

struct AuthResponse: Codable {
    let token: String
    let user: User
}

struct UserResponse: Codable {
    let user: User
}

struct SuccessResponse: Codable {
    let success: Bool
}

struct SignUpRequest: Codable {
    let name: String
    let email: String
    let password: String
}

struct SignInRequest: Codable {
    let email: String
    let password: String
}

struct UpdateProfileRequest: Codable {
    let name: String?
    let avatarUrl: String?
}

struct ChangePasswordRequest: Codable {
    let currentPassword: String
    let newPassword: String
}
