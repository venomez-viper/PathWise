import Foundation

@Observable
class AuthManager {
    var currentUser: User?
    var isAuthenticated: Bool { currentUser != nil }
    var isLoading = false
    var errorMessage: String?

    private let api = APIClient()

    var apiClient: APIClient { api }

    init() {
        if let token = KeychainHelper.getToken() {
            api.authToken = token
        }
    }

    func checkSession() async {
        guard api.authToken != nil else { return }
        isLoading = true
        defer { isLoading = false }
        do {
            let response: UserResponse = try await api.request(.me)
            currentUser = response.user
        } catch {
            signOut()
        }
    }

    func signUp(name: String, email: String, password: String) async throws {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let response: AuthResponse = try await api.request(
                .signup, body: SignUpRequest(name: name, email: email, password: password)
            )
            handleAuthSuccess(response)
        } catch let error as APIError {
            errorMessage = error.localizedDescription
            throw error
        }
    }

    func signIn(email: String, password: String) async throws {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        do {
            let response: AuthResponse = try await api.request(
                .signin, body: SignInRequest(email: email, password: password)
            )
            handleAuthSuccess(response)
        } catch let error as APIError {
            errorMessage = error.localizedDescription
            throw error
        }
    }

    func signOut() {
        KeychainHelper.deleteToken()
        api.authToken = nil
        currentUser = nil
    }

    func updateProfile(name: String?, avatarUrl: String?) async throws {
        let response: UserResponse = try await api.request(
            .updateProfile, body: UpdateProfileRequest(name: name, avatarUrl: avatarUrl)
        )
        currentUser = response.user
    }

    func changePassword(current: String, new: String) async throws {
        let _: SuccessResponse = try await api.request(
            .changePassword, body: ChangePasswordRequest(currentPassword: current, newPassword: new)
        )
    }

    private func handleAuthSuccess(_ response: AuthResponse) {
        KeychainHelper.saveToken(response.token)
        api.authToken = response.token
        currentUser = response.user
    }
}
