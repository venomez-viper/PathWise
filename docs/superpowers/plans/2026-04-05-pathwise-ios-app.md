# PathWise iOS App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a native Swift/SwiftUI iOS app for PathWise with pixel-perfect stitch UI, same Encore.dev backend, and JWT auth.

**Architecture:** iOS 17+ app using @Observable ViewModels, native URLSession networking, Keychain for JWT storage. Tab bar on iPhone, sidebar on iPad via NavigationSplitView. All data live from backend — no local persistence.

**Tech Stack:** Swift, SwiftUI, iOS 17+, URLSession, Keychain Services, SF Symbols

**Spec:** `docs/superpowers/specs/2026-04-05-pathwise-ios-app-design.md`
**Stitch Reference:** `docs/stitch_screens_analysis.md`

---

## File Structure

```
PathWise-iOS/
├── PathWise.xcodeproj
├── PathWise/
│   ├── PathWiseApp.swift
│   ├── ContentView.swift
│   ├── Core/
│   │   ├── Network/
│   │   │   ├── APIClient.swift
│   │   │   ├── APIError.swift
│   │   │   └── Endpoints.swift
│   │   ├── Auth/
│   │   │   ├── AuthManager.swift
│   │   │   └── KeychainHelper.swift
│   │   └── Models/
│   │       ├── User.swift
│   │       ├── Assessment.swift
│   │       ├── Roadmap.swift
│   │       ├── TaskItem.swift
│   │       ├── ProgressStats.swift
│   │       ├── Streak.swift
│   │       ├── Achievement.swift
│   │       ├── AppNotification.swift
│   │       └── Certificate.swift
│   ├── Theme/
│   │   ├── AppColors.swift
│   │   ├── AppTypography.swift
│   │   └── AppTheme.swift
│   ├── Components/
│   │   ├── CircularProgressView.swift
│   │   ├── PillButton.swift
│   │   ├── OutlinedButton.swift
│   │   ├── InputField.swift
│   │   ├── ChipView.swift
│   │   ├── CardView.swift
│   │   ├── BadgeView.swift
│   │   ├── ProgressBarView.swift
│   │   ├── MentorTipCard.swift
│   │   ├── SocialAuthButtons.swift
│   │   └── LoadingView.swift
│   └── Features/
│       ├── Splash/
│       │   └── SplashView.swift
│       ├── Onboarding/
│       │   └── OnboardingCarouselView.swift
│       ├── Auth/
│       │   ├── SignUpView.swift
│       │   ├── SignInView.swift
│       │   ├── ForgotPasswordView.swift
│       │   ├── ResetEmailSentView.swift
│       │   └── EmailVerificationView.swift
│       ├── ProfileSetup/
│       │   ├── ProfileSetupFlow.swift
│       │   ├── AboutYouView.swift
│       │   ├── YourGoalsView.swift
│       │   └── PhotoUploadView.swift
│       ├── Assessment/
│       │   ├── AssessmentIntroView.swift
│       │   ├── AssessmentQuestionView.swift
│       │   ├── AssessmentProcessingView.swift
│       │   ├── AssessmentResultsView.swift
│       │   └── AssessmentViewModel.swift
│       ├── Dashboard/
│       │   ├── DashboardView.swift
│       │   └── DashboardViewModel.swift
│       ├── Roadmap/
│       │   ├── RoadmapView.swift
│       │   ├── AdjustTimelineSheet.swift
│       │   ├── CourseDetailView.swift
│       │   ├── ProjectDetailView.swift
│       │   ├── NetworkingDetailView.swift
│       │   └── RoadmapViewModel.swift
│       ├── Tasks/
│       │   ├── TasksView.swift
│       │   ├── TaskCelebrationView.swift
│       │   └── TasksViewModel.swift
│       ├── Progress/
│       │   ├── ProgressDashboardView.swift
│       │   └── ProgressViewModel.swift
│       ├── Streaks/
│       │   ├── StreakTrackerView.swift
│       │   └── StreaksViewModel.swift
│       ├── Achievements/
│       │   ├── AchievementsView.swift
│       │   └── AchievementsViewModel.swift
│       ├── CareerMatch/
│       │   └── CareerMatchDetailView.swift
│       ├── Notifications/
│       │   ├── NotificationsView.swift
│       │   └── NotificationsViewModel.swift
│       ├── Search/
│       │   ├── SearchView.swift
│       │   └── SearchViewModel.swift
│       ├── Certificates/
│       │   ├── CertificatesView.swift
│       │   └── CertificatesViewModel.swift
│       ├── Settings/
│       │   ├── SettingsView.swift
│       │   ├── EditProfileView.swift
│       │   ├── ChangeTargetRoleView.swift
│       │   └── SettingsViewModel.swift
│       └── Help/
│           └── HelpFAQView.swift
├── PathWiseTests/
│   ├── Core/
│   │   ├── APIClientTests.swift
│   │   ├── AuthManagerTests.swift
│   │   └── KeychainHelperTests.swift
│   └── Features/
│       ├── DashboardViewModelTests.swift
│       ├── AssessmentViewModelTests.swift
│       ├── TasksViewModelTests.swift
│       └── RoadmapViewModelTests.swift
```

---

## Task 1: Create Xcode Project and Theme

**Files:**
- Create: `PathWise-iOS/PathWise/PathWiseApp.swift`
- Create: `PathWise-iOS/PathWise/ContentView.swift`
- Create: `PathWise-iOS/PathWise/Theme/AppColors.swift`
- Create: `PathWise-iOS/PathWise/Theme/AppTypography.swift`
- Create: `PathWise-iOS/PathWise/Theme/AppTheme.swift`

- [ ] **Step 1: Create the Xcode project via command line**

```bash
cd /home/admin1/PathWise
mkdir -p PathWise-iOS/PathWise/Theme
mkdir -p PathWise-iOS/PathWise/Core/Network
mkdir -p PathWise-iOS/PathWise/Core/Auth
mkdir -p PathWise-iOS/PathWise/Core/Models
mkdir -p PathWise-iOS/PathWise/Components
mkdir -p PathWise-iOS/PathWise/Features/Splash
mkdir -p PathWise-iOS/PathWise/Features/Onboarding
mkdir -p PathWise-iOS/PathWise/Features/Auth
mkdir -p PathWise-iOS/PathWise/Features/ProfileSetup
mkdir -p PathWise-iOS/PathWise/Features/Assessment
mkdir -p PathWise-iOS/PathWise/Features/Dashboard
mkdir -p PathWise-iOS/PathWise/Features/Roadmap
mkdir -p PathWise-iOS/PathWise/Features/Tasks
mkdir -p PathWise-iOS/PathWise/Features/Progress
mkdir -p PathWise-iOS/PathWise/Features/Streaks
mkdir -p PathWise-iOS/PathWise/Features/Achievements
mkdir -p PathWise-iOS/PathWise/Features/CareerMatch
mkdir -p PathWise-iOS/PathWise/Features/Notifications
mkdir -p PathWise-iOS/PathWise/Features/Search
mkdir -p PathWise-iOS/PathWise/Features/Certificates
mkdir -p PathWise-iOS/PathWise/Features/Settings
mkdir -p PathWise-iOS/PathWise/Features/Help
mkdir -p PathWise-iOS/PathWiseTests/Core
mkdir -p PathWise-iOS/PathWiseTests/Features
```

- [ ] **Step 2: Create AppColors.swift**

```swift
// PathWise-iOS/PathWise/Theme/AppColors.swift
import SwiftUI

extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

enum AppColors {
    // Brand
    static let primaryPurple = Color(hex: "7C3AED")
    static let darkPurple = Color(hex: "5B21B6")
    static let splashPurple = Color(hex: "7E22CE")
    static let splashPurpleDark = Color(hex: "6B21A8")
    static let tealAccent = Color(hex: "14B8A6")
    static let tealLight = Color(hex: "2DD4BF")

    // Backgrounds
    static let offWhiteBg = Color(hex: "F8F7FC")
    static let lavenderBg = Color(hex: "F5F3FF")
    static let lightPurpleTint = Color(hex: "EDE9FE")
    static let inputBg = Color(hex: "F3F4F6")

    // Text
    static let darkText = Color(hex: "1F2937")
    static let grayText = Color(hex: "6B7280")
    static let lightGrayBorder = Color(hex: "E5E7EB")

    // Semantic
    static let successGreen = Color(hex: "059669")
    static let successGreenLight = Color(hex: "10B981")
    static let errorRed = Color(hex: "EF4444")
    static let highPriorityRed = Color(hex: "DC2626")
    static let warningAmber = Color(hex: "F59E0B")
    static let amberGold = Color(hex: "D4A017")
    static let lowPriorityTeal = Color(hex: "5EEAD4")
    static let mentorTipBg = Color(hex: "FDF6E3")

    // Gradients
    static let purpleGradient = LinearGradient(
        colors: [darkPurple, primaryPurple],
        startPoint: .leading,
        endPoint: .trailing
    )
    static let tealPurpleGradient = LinearGradient(
        colors: [tealAccent, primaryPurple],
        startPoint: .leading,
        endPoint: .trailing
    )
    static let splashGradient = LinearGradient(
        colors: [Color(hex: "7E22CE"), Color(hex: "6B21A8")],
        startPoint: .top,
        endPoint: .bottom
    )
    static let progressGradient = LinearGradient(
        colors: [tealAccent, primaryPurple],
        startPoint: .leading,
        endPoint: .trailing
    )
}
```

- [ ] **Step 3: Create AppTypography.swift**

```swift
// PathWise-iOS/PathWise/Theme/AppTypography.swift
import SwiftUI

enum AppTypography {
    static let largeTitle = Font.system(size: 32, weight: .bold)
    static let title1 = Font.system(size: 28, weight: .bold)
    static let title2 = Font.system(size: 24, weight: .semibold)
    static let title3 = Font.system(size: 20, weight: .semibold)
    static let headline = Font.system(size: 17, weight: .semibold)
    static let body = Font.system(size: 16, weight: .regular)
    static let callout = Font.system(size: 14, weight: .regular)
    static let caption1 = Font.system(size: 12, weight: .semibold)
    static let caption2 = Font.system(size: 10, weight: .regular)
    static let button = Font.system(size: 17, weight: .semibold)

    static func capsLabel(_ size: CGFloat = 10) -> Font {
        .system(size: size, weight: .semibold).leading(.tight)
    }
}

extension View {
    func capsStyle(size: CGFloat = 10, color: Color = AppColors.grayText) -> some View {
        self.font(.system(size: size, weight: .semibold))
            .tracking(1.5)
            .foregroundStyle(color)
            .textCase(.uppercase)
    }
}
```

- [ ] **Step 4: Create AppTheme.swift**

```swift
// PathWise-iOS/PathWise/Theme/AppTheme.swift
import SwiftUI

enum AppTheme {
    // Spacing
    static let screenPadding: CGFloat = 20
    static let cardPadding: CGFloat = 18
    static let sectionSpacing: CGFloat = 20
    static let itemSpacing: CGFloat = 12

    // Heights
    static let inputHeight: CGFloat = 50
    static let ctaHeight: CGFloat = 54
    static let tabBarHeight: CGFloat = 62

    // Radii
    static let cardRadius: CGFloat = 18
    static let buttonRadius: CGFloat = 28
    static let inputRadius: CGFloat = 14
    static let tabBarRadius: CGFloat = 20

    // Shadows
    static let cardShadow = ShadowStyle.drop(
        color: .black.opacity(0.06), radius: 4, x: 0, y: 2
    )
    static let ctaShadowColor = AppColors.primaryPurple.opacity(0.3)
}
```

- [ ] **Step 5: Create placeholder PathWiseApp.swift and ContentView.swift**

```swift
// PathWise-iOS/PathWise/PathWiseApp.swift
import SwiftUI

@main
struct PathWiseApp: App {
    @State private var authManager = AuthManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(authManager)
        }
    }
}
```

```swift
// PathWise-iOS/PathWise/ContentView.swift
import SwiftUI

struct ContentView: View {
    @Environment(AuthManager.self) private var authManager

    var body: some View {
        Group {
            if authManager.isAuthenticated {
                MainTabView()
            } else {
                SignInView()
            }
        }
    }
}
```

Note: `AuthManager`, `MainTabView`, and `SignInView` will be created in subsequent tasks. For now these are forward declarations — the project won't compile until Task 2 and Task 3 are done.

- [ ] **Step 6: Commit**

```bash
cd /home/admin1/PathWise
git add PathWise-iOS/
git commit -m "feat(ios): scaffold project structure and design system theme"
```

---

## Task 2: Core Networking — APIClient, APIError, Endpoints

**Files:**
- Create: `PathWise-iOS/PathWise/Core/Network/APIError.swift`
- Create: `PathWise-iOS/PathWise/Core/Network/Endpoints.swift`
- Create: `PathWise-iOS/PathWise/Core/Network/APIClient.swift`
- Create: `PathWise-iOS/PathWiseTests/Core/APIClientTests.swift`

- [ ] **Step 1: Create APIError.swift**

```swift
// PathWise-iOS/PathWise/Core/Network/APIError.swift
import Foundation

enum APIError: LocalizedError {
    case unauthenticated
    case notFound
    case invalidArgument(String)
    case alreadyExists(String)
    case permissionDenied
    case serverError(Int, String)
    case networkError(Error)
    case decodingError(Error)

    var errorDescription: String? {
        switch self {
        case .unauthenticated:
            return "Your session has expired. Please sign in again."
        case .notFound:
            return "The requested resource was not found."
        case .invalidArgument(let msg):
            return msg
        case .alreadyExists(let msg):
            return msg
        case .permissionDenied:
            return "You don't have permission to do this."
        case .serverError(_, let msg):
            return msg.isEmpty ? "Something went wrong. Please try again." : msg
        case .networkError:
            return "No internet connection. Please check your network."
        case .decodingError:
            return "Something went wrong reading the server response."
        }
    }
}
```

- [ ] **Step 2: Create Endpoints.swift**

```swift
// PathWise-iOS/PathWise/Core/Network/Endpoints.swift
import Foundation

enum Endpoint {
    // Auth
    case signup
    case signin
    case me
    case updateProfile
    case changePassword

    // Assessment
    case getAssessment(userId: String)
    case submitAssessment
    case getCertificateRecs
    case getCareerRecommendations
    case getSkillGapAnalysis

    // Roadmap
    case getRoadmap(userId: String)
    case generateRoadmap
    case completeMilestone(milestoneId: String)

    // Tasks
    case listTasks(userId: String)
    case createTask
    case updateTask(taskId: String)
    case generateMilestoneTasks
    case generateCustomTasks

    // Progress
    case getProgress(userId: String)

    // Streaks
    case getStreak(userId: String)
    case recordActivity

    // Achievements
    case getAchievements(userId: String)
    case awardAchievement

    // Notifications
    case getNotifications(userId: String)
    case markNotificationsRead

    // Certificates
    case getCertificates(userId: String)
    case addCertificate

    var path: String {
        switch self {
        case .signup: return "/auth/signup"
        case .signin: return "/auth/signin"
        case .me, .updateProfile: return "/auth/me"
        case .changePassword: return "/auth/change-password"
        case .getAssessment(let userId): return "/assessment/\(userId)"
        case .submitAssessment: return "/assessment"
        case .getCertificateRecs: return "/assessment/certificates"
        case .getCareerRecommendations: return "/assessment/career-recommendations"
        case .getSkillGapAnalysis: return "/assessment/skill-gap-analysis"
        case .getRoadmap(let userId): return "/roadmap/\(userId)"
        case .generateRoadmap: return "/roadmap"
        case .completeMilestone(let id): return "/roadmap/milestones/\(id)/complete"
        case .listTasks(let userId): return "/tasks?userId=\(userId)"
        case .createTask: return "/tasks"
        case .updateTask(let taskId): return "/tasks/\(taskId)"
        case .generateMilestoneTasks: return "/tasks/generate/milestone"
        case .generateCustomTasks: return "/tasks/generate/custom"
        case .getProgress(let userId): return "/progress/\(userId)"
        case .getStreak(let userId): return "/streaks/\(userId)"
        case .recordActivity: return "/streaks/record"
        case .getAchievements(let userId): return "/streaks/achievements/\(userId)"
        case .awardAchievement: return "/streaks/achievements/award"
        case .getNotifications(let userId): return "/streaks/notifications/\(userId)"
        case .markNotificationsRead: return "/streaks/notifications/read"
        case .getCertificates(let userId): return "/streaks/certificates/\(userId)"
        case .addCertificate: return "/streaks/certificates"
        }
    }

    var method: String {
        switch self {
        case .me, .getAssessment, .getRoadmap, .listTasks, .getProgress,
             .getStreak, .getAchievements, .getNotifications, .getCertificates:
            return "GET"
        case .updateProfile, .updateTask:
            return "PATCH"
        default:
            return "POST"
        }
    }
}
```

- [ ] **Step 3: Create APIClient.swift**

```swift
// PathWise-iOS/PathWise/Core/Network/APIClient.swift
import Foundation

@Observable
class APIClient {
    #if DEBUG
    var baseURL = URL(string: "http://localhost:4000")!
    #else
    var baseURL = URL(string: "https://staging-pathwise-4mxi.encr.app")!
    #endif

    var authToken: String?

    private let decoder: JSONDecoder = {
        let d = JSONDecoder()
        d.keyDecodingStrategy = .convertFromSnakeCase
        return d
    }()

    private let encoder: JSONEncoder = {
        let e = JSONEncoder()
        e.keyEncodingStrategy = .convertToSnakeCase
        return e
    }()

    func request<T: Decodable>(_ endpoint: Endpoint, body: (any Encodable)? = nil) async throws -> T {
        var urlString = baseURL.absoluteString + endpoint.path
        var request = URLRequest(url: URL(string: urlString)!)
        request.httpMethod = endpoint.method
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")

        if let token = authToken {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }

        if let body = body {
            request.httpBody = try encoder.encode(AnyEncodable(body))
        }

        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await URLSession.shared.data(for: request)
        } catch {
            throw APIError.networkError(error)
        }

        guard let httpResponse = response as? HTTPURLResponse else {
            throw APIError.serverError(0, "Invalid response")
        }

        if !(200...299).contains(httpResponse.statusCode) {
            let errorBody = try? JSONSerialization.jsonObject(with: data) as? [String: Any]
            let message = errorBody?["message"] as? String
                ?? errorBody?["code"] as? String
                ?? "Request failed"

            switch httpResponse.statusCode {
            case 401: throw APIError.unauthenticated
            case 404: throw APIError.notFound
            case 400: throw APIError.invalidArgument(message)
            case 409: throw APIError.alreadyExists(message)
            case 403: throw APIError.permissionDenied
            default: throw APIError.serverError(httpResponse.statusCode, message)
            }
        }

        do {
            return try decoder.decode(T.self, from: data)
        } catch {
            throw APIError.decodingError(error)
        }
    }

    /// Fire-and-forget request (no response decoding needed)
    func send(_ endpoint: Endpoint, body: (any Encodable)? = nil) async throws {
        let _: EmptyResponse = try await request(endpoint, body: body)
    }
}

private struct EmptyResponse: Decodable {}

/// Type-erased Encodable wrapper
struct AnyEncodable: Encodable {
    private let _encode: (Encoder) throws -> Void

    init(_ wrapped: any Encodable) {
        _encode = wrapped.encode
    }

    func encode(to encoder: Encoder) throws {
        try _encode(encoder)
    }
}
```

- [ ] **Step 4: Write APIClient test**

```swift
// PathWise-iOS/PathWiseTests/Core/APIClientTests.swift
import XCTest
@testable import PathWise

final class APIClientTests: XCTestCase {
    func testEndpointPaths() {
        XCTAssertEqual(Endpoint.signup.path, "/auth/signup")
        XCTAssertEqual(Endpoint.signin.path, "/auth/signin")
        XCTAssertEqual(Endpoint.me.path, "/auth/me")
        XCTAssertEqual(Endpoint.getAssessment(userId: "abc").path, "/assessment/abc")
        XCTAssertEqual(Endpoint.getRoadmap(userId: "xyz").path, "/roadmap/xyz")
        XCTAssertEqual(Endpoint.listTasks(userId: "u1").path, "/tasks?userId=u1")
        XCTAssertEqual(Endpoint.updateTask(taskId: "t1").path, "/tasks/t1")
        XCTAssertEqual(Endpoint.getProgress(userId: "p1").path, "/progress/p1")
        XCTAssertEqual(Endpoint.completeMilestone(milestoneId: "m1").path, "/roadmap/milestones/m1/complete")
        XCTAssertEqual(Endpoint.getStreak(userId: "s1").path, "/streaks/s1")
        XCTAssertEqual(Endpoint.getAchievements(userId: "a1").path, "/streaks/achievements/a1")
        XCTAssertEqual(Endpoint.getNotifications(userId: "n1").path, "/streaks/notifications/n1")
        XCTAssertEqual(Endpoint.getCertificates(userId: "c1").path, "/streaks/certificates/c1")
    }

    func testEndpointMethods() {
        XCTAssertEqual(Endpoint.me.method, "GET")
        XCTAssertEqual(Endpoint.signup.method, "POST")
        XCTAssertEqual(Endpoint.signin.method, "POST")
        XCTAssertEqual(Endpoint.updateProfile.method, "PATCH")
        XCTAssertEqual(Endpoint.updateTask(taskId: "t1").method, "PATCH")
        XCTAssertEqual(Endpoint.getAssessment(userId: "a").method, "GET")
        XCTAssertEqual(Endpoint.submitAssessment.method, "POST")
        XCTAssertEqual(Endpoint.listTasks(userId: "u").method, "GET")
        XCTAssertEqual(Endpoint.createTask.method, "POST")
    }
}
```

- [ ] **Step 5: Commit**

```bash
git add PathWise-iOS/PathWise/Core/Network/ PathWise-iOS/PathWiseTests/Core/APIClientTests.swift
git commit -m "feat(ios): add APIClient, APIError, and Endpoints"
```

---

## Task 3: Auth — KeychainHelper, AuthManager, Models

**Files:**
- Create: `PathWise-iOS/PathWise/Core/Auth/KeychainHelper.swift`
- Create: `PathWise-iOS/PathWise/Core/Auth/AuthManager.swift`
- Create: `PathWise-iOS/PathWise/Core/Models/User.swift`
- Create: `PathWise-iOS/PathWiseTests/Core/KeychainHelperTests.swift`
- Create: `PathWise-iOS/PathWiseTests/Core/AuthManagerTests.swift`

- [ ] **Step 1: Create User.swift model**

```swift
// PathWise-iOS/PathWise/Core/Models/User.swift
import Foundation

struct User: Codable, Identifiable, Sendable {
    let id: String
    var name: String
    var email: String
    var avatarUrl: String?
    var plan: String // "free" or "premium"
}

// API response wrappers
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
```

- [ ] **Step 2: Create KeychainHelper.swift**

```swift
// PathWise-iOS/PathWise/Core/Auth/KeychainHelper.swift
import Foundation
import Security

enum KeychainHelper {
    private static let service = "com.pathwise.ios"
    private static let tokenKey = "auth_token"

    static func saveToken(_ token: String) {
        let data = Data(token.utf8)
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: tokenKey,
        ]

        // Delete existing
        SecItemDelete(query as CFDictionary)

        // Add new
        var addQuery = query
        addQuery[kSecValueData as String] = data
        SecItemAdd(addQuery as CFDictionary, nil)
    }

    static func getToken() -> String? {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: tokenKey,
            kSecReturnData as String: true,
            kSecMatchLimit as String: kSecMatchLimitOne,
        ]

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)

        guard status == errSecSuccess, let data = result as? Data else {
            return nil
        }

        return String(data: data, encoding: .utf8)
    }

    static func deleteToken() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: tokenKey,
        ]
        SecItemDelete(query as CFDictionary)
    }
}
```

- [ ] **Step 3: Create AuthManager.swift**

```swift
// PathWise-iOS/PathWise/Core/Auth/AuthManager.swift
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
            // Token expired or invalid
            signOut()
        }
    }

    func signUp(name: String, email: String, password: String) async throws {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let response: AuthResponse = try await api.request(
                .signup,
                body: SignUpRequest(name: name, email: email, password: password)
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
                .signin,
                body: SignInRequest(email: email, password: password)
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
            .updateProfile,
            body: UpdateProfileRequest(name: name, avatarUrl: avatarUrl)
        )
        currentUser = response.user
    }

    func changePassword(current: String, new: String) async throws {
        let _: SuccessResponse = try await api.request(
            .changePassword,
            body: ChangePasswordRequest(currentPassword: current, newPassword: new)
        )
    }

    private func handleAuthSuccess(_ response: AuthResponse) {
        KeychainHelper.saveToken(response.token)
        api.authToken = response.token
        currentUser = response.user
    }
}
```

- [ ] **Step 4: Write KeychainHelper test**

```swift
// PathWise-iOS/PathWiseTests/Core/KeychainHelperTests.swift
import XCTest
@testable import PathWise

final class KeychainHelperTests: XCTestCase {
    override func tearDown() {
        KeychainHelper.deleteToken()
    }

    func testSaveAndRetrieveToken() {
        KeychainHelper.saveToken("test-jwt-token-123")
        let token = KeychainHelper.getToken()
        XCTAssertEqual(token, "test-jwt-token-123")
    }

    func testDeleteToken() {
        KeychainHelper.saveToken("to-delete")
        KeychainHelper.deleteToken()
        XCTAssertNil(KeychainHelper.getToken())
    }

    func testOverwriteToken() {
        KeychainHelper.saveToken("old-token")
        KeychainHelper.saveToken("new-token")
        XCTAssertEqual(KeychainHelper.getToken(), "new-token")
    }

    func testGetTokenWhenNoneExists() {
        KeychainHelper.deleteToken()
        XCTAssertNil(KeychainHelper.getToken())
    }
}
```

- [ ] **Step 5: Commit**

```bash
git add PathWise-iOS/PathWise/Core/Auth/ PathWise-iOS/PathWise/Core/Models/User.swift PathWise-iOS/PathWiseTests/Core/
git commit -m "feat(ios): add AuthManager with Keychain JWT storage"
```

---

## Task 4: All Remaining Data Models

**Files:**
- Create: `PathWise-iOS/PathWise/Core/Models/Assessment.swift`
- Create: `PathWise-iOS/PathWise/Core/Models/Roadmap.swift`
- Create: `PathWise-iOS/PathWise/Core/Models/TaskItem.swift`
- Create: `PathWise-iOS/PathWise/Core/Models/ProgressStats.swift`
- Create: `PathWise-iOS/PathWise/Core/Models/Streak.swift`
- Create: `PathWise-iOS/PathWise/Core/Models/Achievement.swift`
- Create: `PathWise-iOS/PathWise/Core/Models/AppNotification.swift`
- Create: `PathWise-iOS/PathWise/Core/Models/Certificate.swift`

- [ ] **Step 1: Create Assessment.swift**

```swift
// PathWise-iOS/PathWise/Core/Models/Assessment.swift
import Foundation

struct AssessmentResult: Codable {
    let userId: String
    let completedAt: String
    let strengths: [String]
    let values: [String]
    let personalityType: String
    let careerMatches: [CareerMatch]
    let skillGaps: [SkillGap]?
    let currentSkills: [String]?
}

struct CareerMatch: Codable, Identifiable {
    var id: String { title }
    let title: String
    let matchScore: Int
    let description: String
    let requiredSkills: [String]
    let pathwayTime: String?
}

struct SkillGap: Codable, Identifiable {
    var id: String { skill }
    let skill: String
    let importance: String // "high", "medium", "low"
    let learningResource: String
}

struct AssessmentResponse: Codable {
    let result: AssessmentResult?
}

struct SubmitAssessmentRequest: Codable {
    let userId: String
    let workStyle: String
    let strengths: [String]
    let values: [String]
    let currentSkills: [String]
    let experienceLevel: String
    let interests: [String]
    let currentRole: String?
    let personalityType: String?
    let rawAnswers: [String: String]?
}

struct CertificateRecsRequest: Codable {
    let userId: String
    let skills: [String]
    let targetRole: String
}

struct CareerRecsRequest: Codable {
    let userId: String
    let skills: [String]
    let targetRole: String
    let currentSkills: [String]
}

struct SkillGapRequest: Codable {
    let targetRole: String
    let technicalSkills: [String]
    let softSkills: [String]
}

struct CertificateRecsResponse: Codable {
    let recommendations: [CertificateRec]
}

struct CertificateRec: Codable, Identifiable {
    var id: String { name }
    let name: String
    let provider: String
    let description: String
    let url: String?
}

struct CareerRecsResponse: Codable {
    let portfolio: [CareerRec]
    let networking: [CareerRec]
    let jobApplications: [CareerRec]
}

struct CareerRec: Codable, Identifiable {
    var id: String { title }
    let title: String
    let description: String
}

struct SkillGapResponse: Codable {
    let result: SkillGapResult
}

struct SkillGapResult: Codable {
    let skillGaps: [SkillGap]
    let summary: String
    let topPriority: String
}
```

- [ ] **Step 2: Create Roadmap.swift**

```swift
// PathWise-iOS/PathWise/Core/Models/Roadmap.swift
import Foundation

struct Roadmap: Codable, Identifiable {
    let id: String
    let userId: String
    let targetRole: String
    let completionPercent: Int
    let milestones: [Milestone]
}

struct Milestone: Codable, Identifiable {
    let id: String
    let title: String
    let description: String
    let status: String // "locked", "in_progress", "completed"
    let dueDate: String?
    let estimatedWeeks: Int?
    let skillsTargeted: String?
}

struct RoadmapResponse: Codable {
    let roadmap: Roadmap?
}

struct GenerateRoadmapRequest: Codable {
    let userId: String
    let targetRole: String
    let timeline: String?
}

struct CompleteMilestoneResponse: Codable {
    let success: Bool
    let nextMilestoneId: String?
}
```

- [ ] **Step 3: Create TaskItem.swift**

```swift
// PathWise-iOS/PathWise/Core/Models/TaskItem.swift
import Foundation

struct TaskItem: Codable, Identifiable {
    let id: String
    let userId: String
    let milestoneId: String?
    let title: String
    let description: String?
    var status: String // "todo", "in_progress", "done"
    let priority: String // "low", "medium", "high"
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
```

- [ ] **Step 4: Create ProgressStats.swift**

```swift
// PathWise-iOS/PathWise/Core/Models/ProgressStats.swift
import Foundation

struct ProgressStats: Codable {
    let roadmapCompletion: Int
    let tasksFinished: Int
    let tasksRemaining: Int
    let jobReadinessScore: Int
    let careerReadinessScore: Int
    let breakdown: ReadinessBreakdown?
}

struct ReadinessBreakdown: Codable {
    let milestoneProgress: Int
    let taskCompletion: Int
    let categoryBalance: Int
    let momentum: Int
    let overall: Int
}

struct ProgressResponse: Codable {
    let stats: ProgressStats
}
```

- [ ] **Step 5: Create Streak.swift**

```swift
// PathWise-iOS/PathWise/Core/Models/Streak.swift
import Foundation

struct StreakData: Codable {
    let currentStreak: Int
    let bestStreak: Int
    let lastActiveDate: String?
    let consistencyScore: Int
    let totalXp: Int
    let weeklyProgress: [Bool]
}

struct StreakResponse: Codable {
    let streak: StreakData
}

struct RecordActivityRequest: Codable {
    let userId: String
}
```

- [ ] **Step 6: Create Achievement.swift**

```swift
// PathWise-iOS/PathWise/Core/Models/Achievement.swift
import Foundation

struct AchievementData: Codable, Identifiable {
    var id: String { badgeKey }
    let badgeKey: String
    let title: String
    let description: String
    let earnedAt: String?
}

struct AchievementsResponse: Codable {
    let achievements: [AchievementData]
    let totalBadges: Int
    let earnedCount: Int
    let totalXp: Int
    let seasonProgress: SeasonProgress?
}

struct SeasonProgress: Codable {
    let level: Int
    let currentXp: Int
    let nextLevelXp: Int
    let tier: String
}

struct AwardAchievementRequest: Codable {
    let userId: String
    let badgeKey: String
}
```

- [ ] **Step 7: Create AppNotification.swift**

```swift
// PathWise-iOS/PathWise/Core/Models/AppNotification.swift
import Foundation

struct AppNotification: Codable, Identifiable {
    let id: String
    let userId: String
    let type: String // "task", "achievement", "streak", "roadmap", "progress"
    let title: String
    let body: String
    let read: Bool
    let createdAt: String
}

struct NotificationsResponse: Codable {
    let notifications: [AppNotification]
    let unreadCount: Int
}

struct MarkReadRequest: Codable {
    let userId: String
}
```

- [ ] **Step 8: Create Certificate.swift**

```swift
// PathWise-iOS/PathWise/Core/Models/Certificate.swift
import Foundation

struct Certificate: Codable, Identifiable {
    let id: String
    let userId: String
    let name: String
    let issuer: String
    let issuedDate: String?
    let verified: Bool
    let url: String?
    let createdAt: String
}

struct CertificatesResponse: Codable {
    let certificates: [Certificate]
}

struct AddCertificateRequest: Codable {
    let userId: String
    let name: String
    let issuer: String
    let issuedDate: String?
    let url: String?
}

struct CertificateResponse: Codable {
    let certificate: Certificate
}
```

- [ ] **Step 9: Commit**

```bash
git add PathWise-iOS/PathWise/Core/Models/
git commit -m "feat(ios): add all data models matching backend API"
```

---

## Task 5: Reusable UI Components

**Files:**
- Create: `PathWise-iOS/PathWise/Components/CircularProgressView.swift`
- Create: `PathWise-iOS/PathWise/Components/PillButton.swift`
- Create: `PathWise-iOS/PathWise/Components/OutlinedButton.swift`
- Create: `PathWise-iOS/PathWise/Components/InputField.swift`
- Create: `PathWise-iOS/PathWise/Components/ChipView.swift`
- Create: `PathWise-iOS/PathWise/Components/CardView.swift`
- Create: `PathWise-iOS/PathWise/Components/BadgeView.swift`
- Create: `PathWise-iOS/PathWise/Components/ProgressBarView.swift`
- Create: `PathWise-iOS/PathWise/Components/MentorTipCard.swift`
- Create: `PathWise-iOS/PathWise/Components/SocialAuthButtons.swift`
- Create: `PathWise-iOS/PathWise/Components/LoadingView.swift`

- [ ] **Step 1: Create CircularProgressView.swift**

```swift
// PathWise-iOS/PathWise/Components/CircularProgressView.swift
import SwiftUI

struct CircularProgressView: View {
    let progress: Double // 0.0 to 1.0
    var size: CGFloat = 100
    var lineWidth: CGFloat = 10
    var trackColor: Color = AppColors.lightGrayBorder
    var progressColor: Color = AppColors.tealAccent
    var showPercentage: Bool = true

    var body: some View {
        ZStack {
            Circle()
                .stroke(trackColor, lineWidth: lineWidth)

            Circle()
                .trim(from: 0, to: progress)
                .stroke(progressColor, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
                .animation(.easeOut(duration: 1.0), value: progress)

            if showPercentage {
                VStack(spacing: 2) {
                    Text("\(Int(progress * 100))%")
                        .font(size > 80 ? AppTypography.title2 : AppTypography.headline)
                        .fontWeight(.bold)
                        .foregroundStyle(AppColors.darkText)
                    if size > 100 {
                        Text("READY")
                            .capsStyle()
                    }
                }
            }
        }
        .frame(width: size, height: size)
    }
}
```

- [ ] **Step 2: Create PillButton.swift**

```swift
// PathWise-iOS/PathWise/Components/PillButton.swift
import SwiftUI

struct PillButton: View {
    let title: String
    var icon: String? = nil
    var isLoading: Bool = false
    var disabled: Bool = false
    var gradient: LinearGradient? = nil
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if isLoading {
                    ProgressView()
                        .tint(.white)
                } else {
                    if let icon {
                        Image(systemName: icon)
                    }
                    Text(title)
                }
            }
            .font(AppTypography.button)
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: AppTheme.ctaHeight)
            .background(
                gradient ?? AppColors.purpleGradient,
                in: Capsule()
            )
            .shadow(color: AppTheme.ctaShadowColor, radius: 6, x: 0, y: 4)
        }
        .disabled(isLoading || disabled)
        .opacity(disabled ? 0.5 : 1.0)
    }
}
```

- [ ] **Step 3: Create OutlinedButton.swift**

```swift
// PathWise-iOS/PathWise/Components/OutlinedButton.swift
import SwiftUI

struct OutlinedButton: View {
    let title: String
    var icon: String? = nil
    var color: Color = AppColors.primaryPurple
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if let icon {
                    Image(systemName: icon)
                }
                Text(title)
            }
            .font(AppTypography.button)
            .foregroundStyle(color)
            .frame(maxWidth: .infinity)
            .frame(height: 48)
            .background(
                Capsule()
                    .stroke(color, lineWidth: 1.5)
            )
        }
    }
}
```

- [ ] **Step 4: Create InputField.swift**

```swift
// PathWise-iOS/PathWise/Components/InputField.swift
import SwiftUI

struct InputField: View {
    let label: String
    let icon: String
    let placeholder: String
    @Binding var text: String
    var isSecure: Bool = false
    var errorMessage: String? = nil

    @State private var showPassword = false

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .capsStyle(size: 11, color: AppColors.darkText)

            HStack(spacing: 12) {
                Image(systemName: icon)
                    .foregroundStyle(AppColors.grayText)
                    .frame(width: 20)

                if isSecure && !showPassword {
                    SecureField(placeholder, text: $text)
                } else {
                    TextField(placeholder, text: $text)
                }

                if isSecure {
                    Button {
                        showPassword.toggle()
                    } label: {
                        Image(systemName: showPassword ? "eye.slash" : "eye")
                            .foregroundStyle(AppColors.grayText)
                    }
                }
            }
            .font(AppTypography.body)
            .padding(.horizontal, 16)
            .frame(height: AppTheme.inputHeight)
            .background(AppColors.inputBg, in: RoundedRectangle(cornerRadius: AppTheme.inputRadius))

            if let errorMessage {
                Text(errorMessage)
                    .font(AppTypography.callout)
                    .foregroundStyle(AppColors.errorRed)
            }
        }
    }
}
```

- [ ] **Step 5: Create ChipView.swift**

```swift
// PathWise-iOS/PathWise/Components/ChipView.swift
import SwiftUI

struct ChipView: View {
    let title: String
    let isSelected: Bool
    var icon: String? = nil
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.system(size: 12, weight: .bold))
                } else if let icon {
                    Image(systemName: icon)
                        .font(.system(size: 12))
                }
                Text(title)
                    .font(.system(size: 14, weight: .medium))
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .foregroundStyle(isSelected ? .white : AppColors.grayText)
            .background(
                isSelected ? AnyShapeStyle(AppColors.primaryPurple) : AnyShapeStyle(Color.clear)
            )
            .overlay(
                Capsule()
                    .stroke(isSelected ? Color.clear : AppColors.lightGrayBorder, lineWidth: 1)
            )
            .clipShape(Capsule())
        }
    }
}
```

- [ ] **Step 6: Create CardView.swift**

```swift
// PathWise-iOS/PathWise/Components/CardView.swift
import SwiftUI

struct CardView<Content: View>: View {
    var padding: CGFloat = AppTheme.cardPadding
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            content
        }
        .padding(padding)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white, in: RoundedRectangle(cornerRadius: AppTheme.cardRadius))
        .shadow(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)
    }
}
```

- [ ] **Step 7: Create BadgeView.swift**

```swift
// PathWise-iOS/PathWise/Components/BadgeView.swift
import SwiftUI

enum BadgeStyle {
    case highPriority, mediumPriority, lowPriority
    case verified, bestMatch, current
    case custom(Color, Color)

    var backgroundColor: Color {
        switch self {
        case .highPriority: return AppColors.highPriorityRed.opacity(0.15)
        case .mediumPriority: return AppColors.warningAmber.opacity(0.15)
        case .lowPriority: return AppColors.lowPriorityTeal.opacity(0.2)
        case .verified, .bestMatch: return AppColors.successGreen.opacity(0.15)
        case .current: return AppColors.tealAccent.opacity(0.15)
        case .custom(let bg, _): return bg
        }
    }

    var textColor: Color {
        switch self {
        case .highPriority: return AppColors.highPriorityRed
        case .mediumPriority: return AppColors.warningAmber
        case .lowPriority: return AppColors.tealAccent
        case .verified, .bestMatch: return AppColors.successGreen
        case .current: return AppColors.tealAccent
        case .custom(_, let fg): return fg
        }
    }
}

struct BadgeView: View {
    let text: String
    let style: BadgeStyle

    var body: some View {
        Text(text)
            .font(.system(size: 10, weight: .bold))
            .tracking(0.5)
            .textCase(.uppercase)
            .foregroundStyle(style.textColor)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(style.backgroundColor, in: Capsule())
    }
}
```

- [ ] **Step 8: Create ProgressBarView.swift**

```swift
// PathWise-iOS/PathWise/Components/ProgressBarView.swift
import SwiftUI

struct ProgressBarView: View {
    let progress: Double // 0.0 to 1.0
    var height: CGFloat = 6
    var trackColor: Color = AppColors.lightGrayBorder
    var gradient: LinearGradient = AppColors.progressGradient

    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule()
                    .fill(trackColor)
                    .frame(height: height)

                Capsule()
                    .fill(gradient)
                    .frame(width: max(0, geo.size.width * progress), height: height)
                    .animation(.easeOut(duration: 0.8), value: progress)
            }
        }
        .frame(height: height)
    }
}
```

- [ ] **Step 9: Create MentorTipCard.swift**

```swift
// PathWise-iOS/PathWise/Components/MentorTipCard.swift
import SwiftUI

struct MentorTipCard: View {
    let title: String
    let message: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "sparkles")
                .foregroundStyle(AppColors.successGreen)
                .frame(width: 24)

            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(AppColors.darkText)
                Text(message)
                    .font(.system(size: 12))
                    .foregroundStyle(AppColors.darkText.opacity(0.8))
            }
        }
        .padding(16)
        .background(AppColors.mentorTipBg, in: RoundedRectangle(cornerRadius: 12))
    }
}
```

- [ ] **Step 10: Create SocialAuthButtons.swift**

```swift
// PathWise-iOS/PathWise/Components/SocialAuthButtons.swift
import SwiftUI

struct SocialAuthButtons: View {
    var body: some View {
        HStack(spacing: 16) {
            socialButton(icon: "g.circle.fill", label: "Google")
            socialButton(icon: "apple.logo", label: "Apple")
        }
    }

    private func socialButton(icon: String, label: String) -> some View {
        Button {} label: {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.system(size: 20))
                Text(label)
                    .font(.system(size: 14, weight: .medium))
            }
            .foregroundStyle(AppColors.darkText)
            .frame(maxWidth: .infinity)
            .frame(height: 48)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(AppColors.lightGrayBorder, lineWidth: 1)
            )
        }
    }
}
```

- [ ] **Step 11: Create LoadingView.swift**

```swift
// PathWise-iOS/PathWise/Components/LoadingView.swift
import SwiftUI

struct LoadingView: View {
    var message: String = "Loading..."

    var body: some View {
        VStack(spacing: 16) {
            ProgressView()
                .controlSize(.large)
                .tint(AppColors.primaryPurple)
            Text(message)
                .font(AppTypography.callout)
                .foregroundStyle(AppColors.grayText)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(AppColors.offWhiteBg)
    }
}
```

- [ ] **Step 12: Commit**

```bash
git add PathWise-iOS/PathWise/Components/
git commit -m "feat(ios): add all reusable UI components matching stitch design"
```

---

## Task 6: Navigation — MainTabView and Sidebar

**Files:**
- Create: `PathWise-iOS/PathWise/Features/MainTabView.swift`

- [ ] **Step 1: Create MainTabView.swift with adaptive iPhone/iPad layout**

```swift
// PathWise-iOS/PathWise/Features/MainTabView.swift
import SwiftUI

enum AppTab: String, CaseIterable, Identifiable {
    case home = "Home"
    case roadmap = "Roadmap"
    case tasks = "Tasks"
    case progress = "Progress"
    case settings = "Settings"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .home: return "house.fill"
        case .roadmap: return "point.topleft.down.to.point.bottomright.curvepath.fill"
        case .tasks: return "checklist"
        case .progress: return "chart.bar.fill"
        case .settings: return "gearshape.fill"
        }
    }

    var iconOutlined: String {
        switch self {
        case .home: return "house"
        case .roadmap: return "point.topleft.down.to.point.bottomright.curvepath"
        case .tasks: return "checklist"
        case .progress: return "chart.bar"
        case .settings: return "gearshape"
        }
    }
}

enum SecondaryDestination: String, CaseIterable, Identifiable {
    case streaks = "Streaks"
    case achievements = "Achievements"
    case certificates = "Certificates"
    case notifications = "Notifications"
    case search = "Search"
    case help = "Help & FAQ"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .streaks: return "flame.fill"
        case .achievements: return "trophy.fill"
        case .certificates: return "scroll.fill"
        case .notifications: return "bell.fill"
        case .search: return "magnifyingglass"
        case .help: return "questionmark.circle.fill"
        }
    }
}

struct MainTabView: View {
    @Environment(AuthManager.self) private var authManager
    @State private var selectedTab: AppTab = .home

    var body: some View {
        if UIDevice.current.userInterfaceIdiom == .pad {
            iPadSidebarLayout
        } else {
            iPhoneTabLayout
        }
    }

    // MARK: - iPhone Tab Bar

    private var iPhoneTabLayout: some View {
        TabView(selection: $selectedTab) {
            ForEach(AppTab.allCases) { tab in
                NavigationStack {
                    tabContent(for: tab)
                }
                .tabItem {
                    Label(tab.rawValue.uppercased(), systemImage: selectedTab == tab ? tab.icon : tab.iconOutlined)
                }
                .tag(tab)
            }
        }
        .tint(AppColors.primaryPurple)
    }

    // MARK: - iPad Sidebar

    @State private var selectedSidebar: String? = AppTab.home.rawValue

    private var iPadSidebarLayout: some View {
        NavigationSplitView {
            List(selection: $selectedSidebar) {
                Section("Main") {
                    ForEach(AppTab.allCases) { tab in
                        Label(tab.rawValue, systemImage: tab.icon)
                            .tag(tab.rawValue)
                    }
                }
                Section("More") {
                    ForEach(SecondaryDestination.allCases) { dest in
                        Label(dest.rawValue, systemImage: dest.icon)
                            .tag(dest.rawValue)
                    }
                }
            }
            .navigationTitle("PathWise")
            .tint(AppColors.primaryPurple)
        } detail: {
            if let selected = selectedSidebar {
                if let tab = AppTab(rawValue: selected) {
                    NavigationStack {
                        tabContent(for: tab)
                    }
                } else if let dest = SecondaryDestination(rawValue: selected) {
                    NavigationStack {
                        secondaryContent(for: dest)
                    }
                }
            }
        }
    }

    @ViewBuilder
    private func tabContent(for tab: AppTab) -> some View {
        switch tab {
        case .home: DashboardView()
        case .roadmap: RoadmapView()
        case .tasks: TasksView()
        case .progress: ProgressDashboardView()
        case .settings: SettingsView()
        }
    }

    @ViewBuilder
    private func secondaryContent(for dest: SecondaryDestination) -> some View {
        switch dest {
        case .streaks: StreakTrackerView()
        case .achievements: AchievementsView()
        case .certificates: CertificatesView()
        case .notifications: NotificationsView()
        case .search: SearchView()
        case .help: HelpFAQView()
        }
    }
}
```

Note: The referenced views (DashboardView, RoadmapView, etc.) will be created in subsequent tasks. This task establishes the navigation container.

- [ ] **Step 2: Commit**

```bash
git add PathWise-iOS/PathWise/Features/MainTabView.swift
git commit -m "feat(ios): add adaptive TabBar/Sidebar navigation"
```

---

## Task 7: Splash and Onboarding Screens

**Files:**
- Create: `PathWise-iOS/PathWise/Features/Splash/SplashView.swift`
- Create: `PathWise-iOS/PathWise/Features/Onboarding/OnboardingCarouselView.swift`

- [ ] **Step 1: Create SplashView.swift**

```swift
// PathWise-iOS/PathWise/Features/Splash/SplashView.swift
import SwiftUI

struct SplashView: View {
    @Environment(AuthManager.self) private var authManager
    @State private var showIcon = false
    @State private var showSparkle = false
    @State private var showText = false
    @State private var showLoading = false
    @State private var isFinished = false

    var body: some View {
        ZStack {
            AppColors.splashGradient
                .ignoresSafeArea()

            VStack(spacing: 12) {
                Spacer()

                // App Icon
                ZStack {
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color.white.opacity(0.15))
                        .frame(width: 56, height: 56)
                        .overlay {
                            Image(systemName: "book.fill")
                                .font(.system(size: 28))
                                .foregroundStyle(.white)
                        }
                        .scaleEffect(showIcon ? 1 : 0.3)
                        .opacity(showIcon ? 1 : 0)

                    // Sparkle
                    Image(systemName: "sparkle")
                        .font(.system(size: 14))
                        .foregroundStyle(AppColors.tealLight)
                        .offset(x: 24, y: -20)
                        .scaleEffect(showSparkle ? 1 : 0)
                        .opacity(showSparkle ? 1 : 0)
                }

                // App Name
                Text("PathWise")
                    .font(.system(size: 32, weight: .bold))
                    .foregroundStyle(.white)
                    .opacity(showText ? 1 : 0)
                    .offset(y: showText ? 0 : 10)

                // Tagline
                Text("Your AI-powered career co-pilot.")
                    .font(.system(size: 16))
                    .foregroundStyle(.white.opacity(0.9))
                    .opacity(showText ? 1 : 0)

                Spacer()

                // Loading label
                Text("INITIALIZING INTELLIGENCE")
                    .font(.system(size: 10, weight: .semibold))
                    .tracking(2)
                    .foregroundStyle(.white.opacity(0.5))
                    .opacity(showLoading ? 1 : 0)
                    .padding(.bottom, 40)
            }
        }
        .onAppear {
            runAnimation()
        }
    }

    private func runAnimation() {
        withAnimation(.spring(response: 0.6)) {
            showIcon = true
        }
        withAnimation(.spring(response: 0.4).delay(0.3)) {
            showSparkle = true
        }
        withAnimation(.easeOut(duration: 0.4).delay(0.5)) {
            showText = true
        }
        withAnimation(.easeIn(duration: 0.3).delay(0.8)) {
            showLoading = true
        }

        Task {
            await authManager.checkSession()
            try? await Task.sleep(for: .seconds(1.5))
            withAnimation {
                isFinished = true
            }
        }
    }
}
```

- [ ] **Step 2: Create OnboardingCarouselView.swift**

```swift
// PathWise-iOS/PathWise/Features/Onboarding/OnboardingCarouselView.swift
import SwiftUI

struct OnboardingPage: Identifiable {
    let id = UUID()
    let icon: String
    let title: String
    let highlightedTitle: String
    let description: String
}

struct OnboardingCarouselView: View {
    @Binding var showOnboarding: Bool

    @State private var currentPage = 0

    private let pages: [OnboardingPage] = [
        OnboardingPage(
            icon: "person.crop.circle.badge.questionmark",
            title: "Discover Your",
            highlightedTitle: "Career Identity",
            description: "Take a quick assessment and uncover the career paths that match your unique strengths."
        ),
        OnboardingPage(
            icon: "map.fill",
            title: "Follow Your",
            highlightedTitle: "Personal Roadmap",
            description: "Get an AI-generated career roadmap with milestones, tasks, and timelines tailored to you."
        ),
        OnboardingPage(
            icon: "chart.line.uptrend.xyaxis",
            title: "Track Your",
            highlightedTitle: "Growth Daily",
            description: "Build streaks, earn achievements, and watch your career readiness score climb."
        ),
    ]

    var body: some View {
        VStack(spacing: 0) {
            // Top bar
            HStack {
                HStack(spacing: 6) {
                    Image(systemName: "book.fill")
                        .foregroundStyle(AppColors.primaryPurple)
                    Text("PathWise")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(AppColors.primaryPurple)
                }
                Spacer()
                Button("SKIP") {
                    showOnboarding = false
                }
                .capsStyle(size: 12, color: AppColors.grayText)
            }
            .padding(.horizontal, AppTheme.screenPadding)
            .padding(.top, 16)

            // Pages
            TabView(selection: $currentPage) {
                ForEach(Array(pages.enumerated()), id: \.offset) { index, page in
                    VStack(spacing: 24) {
                        Spacer()

                        // Hero illustration
                        ZStack {
                            Circle()
                                .fill(AppColors.lavenderBg)
                                .frame(width: 140, height: 140)
                            Image(systemName: page.icon)
                                .font(.system(size: 56))
                                .foregroundStyle(AppColors.primaryPurple)
                        }

                        // Text
                        VStack(spacing: 8) {
                            Text(page.title)
                                .font(AppTypography.title1)
                                .foregroundStyle(AppColors.darkText)
                            Text(page.highlightedTitle)
                                .font(AppTypography.title1)
                                .italic()
                                .foregroundStyle(AppColors.primaryPurple)
                        }

                        Text(page.description)
                            .font(AppTypography.callout)
                            .foregroundStyle(AppColors.grayText)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal, 32)

                        Spacer()
                    }
                    .tag(index)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .always))

            // Bottom CTA
            VStack(spacing: 16) {
                PillButton(title: "Get Started") {
                    showOnboarding = false
                }
                .padding(.horizontal, AppTheme.screenPadding)

                HStack(spacing: 4) {
                    Text("Already have an account?")
                        .font(AppTypography.callout)
                        .foregroundStyle(AppColors.grayText)
                    Button("Log In") {
                        showOnboarding = false
                    }
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(AppColors.primaryPurple)
                }
                .padding(.bottom, 24)
            }
        }
        .background(.white)
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add PathWise-iOS/PathWise/Features/Splash/ PathWise-iOS/PathWise/Features/Onboarding/
git commit -m "feat(ios): add splash screen and onboarding carousel"
```

---

## Task 8: Auth Screens — SignIn, SignUp, ForgotPassword, ResetSent, EmailVerification

**Files:**
- Create: `PathWise-iOS/PathWise/Features/Auth/SignInView.swift`
- Create: `PathWise-iOS/PathWise/Features/Auth/SignUpView.swift`
- Create: `PathWise-iOS/PathWise/Features/Auth/ForgotPasswordView.swift`
- Create: `PathWise-iOS/PathWise/Features/Auth/ResetEmailSentView.swift`
- Create: `PathWise-iOS/PathWise/Features/Auth/EmailVerificationView.swift`

- [ ] **Step 1: Create SignInView.swift**

```swift
// PathWise-iOS/PathWise/Features/Auth/SignInView.swift
import SwiftUI

struct SignInView: View {
    @Environment(AuthManager.self) private var authManager
    @State private var email = ""
    @State private var password = ""
    @State private var showSignUp = false
    @State private var showForgotPassword = false

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    // Logo
                    HStack(spacing: 6) {
                        Image(systemName: "book.fill")
                        Text("PathWise")
                            .font(.system(size: 22, weight: .bold))
                    }
                    .foregroundStyle(AppColors.primaryPurple)
                    .padding(.top, 40)

                    // Card
                    CardView {
                        VStack(alignment: .leading, spacing: 20) {
                            Text("Welcome back")
                                .font(AppTypography.title1)
                                .foregroundStyle(AppColors.darkText)
                            Text("Continue your journey to career mastery.")
                                .font(AppTypography.callout)
                                .foregroundStyle(AppColors.grayText)

                            // Form
                            InputField(
                                label: "EMAIL ADDRESS",
                                icon: "envelope",
                                placeholder: "name@example.com",
                                text: $email
                            )
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)

                            VStack(alignment: .leading, spacing: 6) {
                                HStack {
                                    Text("PASSWORD")
                                        .capsStyle(size: 11, color: AppColors.darkText)
                                    Spacer()
                                    Button("Forgot password?") {
                                        showForgotPassword = true
                                    }
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundStyle(AppColors.primaryPurple)
                                }
                                InputField(
                                    label: "",
                                    icon: "lock",
                                    placeholder: "Enter password",
                                    text: $password,
                                    isSecure: true
                                )
                            }

                            if let error = authManager.errorMessage {
                                Text(error)
                                    .font(AppTypography.callout)
                                    .foregroundStyle(AppColors.errorRed)
                            }

                            PillButton(
                                title: "Log In",
                                icon: "arrow.right",
                                isLoading: authManager.isLoading
                            ) {
                                Task {
                                    try? await authManager.signIn(email: email, password: password)
                                }
                            }

                            // Divider
                            HStack {
                                Rectangle().fill(AppColors.lightGrayBorder).frame(height: 1)
                                Text("OR CONTINUE WITH")
                                    .capsStyle(size: 10)
                                Rectangle().fill(AppColors.lightGrayBorder).frame(height: 1)
                            }

                            SocialAuthButtons()

                            // Toggle
                            HStack(spacing: 4) {
                                Text("Don't have an account?")
                                    .font(AppTypography.callout)
                                    .foregroundStyle(AppColors.grayText)
                                Button("Sign Up") {
                                    showSignUp = true
                                }
                                .font(.system(size: 14, weight: .bold))
                                .foregroundStyle(AppColors.primaryPurple)
                            }
                            .frame(maxWidth: .infinity, alignment: .center)
                        }
                    }
                    .padding(.horizontal, AppTheme.screenPadding)
                }
            }
            .background(AppColors.lavenderBg)
            .navigationDestination(isPresented: $showSignUp) {
                SignUpView()
            }
            .sheet(isPresented: $showForgotPassword) {
                ForgotPasswordView()
            }
        }
    }
}
```

- [ ] **Step 2: Create SignUpView.swift**

```swift
// PathWise-iOS/PathWise/Features/Auth/SignUpView.swift
import SwiftUI

struct SignUpView: View {
    @Environment(AuthManager.self) private var authManager
    @Environment(\.dismiss) private var dismiss
    @State private var name = ""
    @State private var email = ""
    @State private var password = ""

    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Logo
                HStack(spacing: 6) {
                    Image(systemName: "book.fill")
                    Text("PathWise")
                        .font(.system(size: 22, weight: .bold))
                }
                .foregroundStyle(AppColors.primaryPurple)
                .padding(.top, 40)

                // Card
                CardView {
                    VStack(spacing: 20) {
                        Text("Create your account")
                            .font(AppTypography.title1)
                            .foregroundStyle(AppColors.darkText)
                            .frame(maxWidth: .infinity, alignment: .center)
                        Text("Join the professional growth ecosystem.")
                            .font(AppTypography.callout)
                            .foregroundStyle(AppColors.grayText)
                            .frame(maxWidth: .infinity, alignment: .center)

                        SocialAuthButtons()

                        // Divider
                        HStack {
                            Rectangle().fill(AppColors.lightGrayBorder).frame(height: 1)
                            Text("OR CONTINUE WITH EMAIL")
                                .capsStyle(size: 10)
                            Rectangle().fill(AppColors.lightGrayBorder).frame(height: 1)
                        }

                        InputField(label: "FULL NAME", icon: "person", placeholder: "John Doe", text: $name)
                            .textContentType(.name)

                        InputField(label: "EMAIL", icon: "envelope", placeholder: "john@company.com", text: $email)
                            .textContentType(.emailAddress)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)

                        InputField(label: "PASSWORD", icon: "lock", placeholder: "8+ characters", text: $password, isSecure: true)
                            .textContentType(.newPassword)

                        if let error = authManager.errorMessage {
                            Text(error)
                                .font(AppTypography.callout)
                                .foregroundStyle(AppColors.errorRed)
                        }

                        PillButton(
                            title: "Sign Up",
                            isLoading: authManager.isLoading,
                            disabled: name.isEmpty || email.isEmpty || password.count < 8
                        ) {
                            Task {
                                try? await authManager.signUp(name: name, email: email, password: password)
                            }
                        }

                        HStack(spacing: 4) {
                            Text("Already have an account?")
                                .font(AppTypography.callout)
                                .foregroundStyle(AppColors.grayText)
                            Button("Log In") { dismiss() }
                                .font(.system(size: 14, weight: .bold))
                                .foregroundStyle(AppColors.primaryPurple)
                        }
                    }
                }
                .padding(.horizontal, AppTheme.screenPadding)

                // Footer
                Text("By creating an account, you agree to PathWise's Terms of Service and Privacy Policy.")
                    .font(AppTypography.caption2)
                    .foregroundStyle(AppColors.grayText)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)
            }
        }
        .background(AppColors.lavenderBg)
        .navigationBarBackButtonHidden()
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button { dismiss() } label: {
                    Image(systemName: "chevron.left")
                        .foregroundStyle(AppColors.primaryPurple)
                }
            }
        }
    }
}
```

- [ ] **Step 3: Create ForgotPasswordView.swift**

```swift
// PathWise-iOS/PathWise/Features/Auth/ForgotPasswordView.swift
import SwiftUI

struct ForgotPasswordView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var email = ""
    @State private var showSent = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                Spacer()

                Image(systemName: "lock.shield")
                    .font(.system(size: 40))
                    .foregroundStyle(AppColors.primaryPurple)
                    .frame(width: 64, height: 64)
                    .background(AppColors.lightPurpleTint, in: Circle())

                Text("Reset your password")
                    .font(AppTypography.title2)
                    .foregroundStyle(AppColors.darkText)

                Text("Enter the email associated with your PathWise account and we'll send a secure reset link.")
                    .font(AppTypography.callout)
                    .foregroundStyle(AppColors.grayText)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 32)

                CardView {
                    VStack(spacing: 16) {
                        InputField(label: "EMAIL ADDRESS", icon: "envelope", placeholder: "name@career.com", text: $email)
                            .keyboardType(.emailAddress)
                            .autocapitalization(.none)

                        PillButton(title: "Send Reset Link", disabled: email.isEmpty) {
                            showSent = true
                        }
                    }
                }
                .padding(.horizontal, AppTheme.screenPadding)

                Button {
                    dismiss()
                } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "arrow.left")
                        Text("Back to Log In")
                    }
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(AppColors.darkText)
                }

                Spacer()
            }
            .background(
                LinearGradient(
                    colors: [.white, Color(hex: "FDE8E0"), AppColors.lavenderBg],
                    startPoint: .top,
                    endPoint: .bottom
                )
                .ignoresSafeArea()
            )
            .navigationDestination(isPresented: $showSent) {
                ResetEmailSentView(email: email)
            }
        }
    }
}
```

- [ ] **Step 4: Create ResetEmailSentView.swift**

```swift
// PathWise-iOS/PathWise/Features/Auth/ResetEmailSentView.swift
import SwiftUI

struct ResetEmailSentView: View {
    let email: String
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            ZStack(alignment: .bottomTrailing) {
                Image(systemName: "envelope.fill")
                    .font(.system(size: 48))
                    .foregroundStyle(AppColors.primaryPurple)
                Image(systemName: "checkmark.circle.fill")
                    .font(.system(size: 20))
                    .foregroundStyle(AppColors.successGreen)
                    .offset(x: 8, y: 4)
            }

            Text("Check your inbox")
                .font(AppTypography.title2)
                .foregroundStyle(AppColors.darkText)

            Text("We've sent a password reset link to **\(email)**")
                .font(AppTypography.callout)
                .foregroundStyle(AppColors.grayText)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)

            OutlinedButton(title: "Open Email App", icon: "envelope") {
                if let url = URL(string: "message://") {
                    UIApplication.shared.open(url)
                }
            }
            .padding(.horizontal, AppTheme.screenPadding)

            HStack(spacing: 4) {
                Text("Didn't receive the email?")
                    .font(AppTypography.callout)
                    .foregroundStyle(AppColors.grayText)
                Button("Resend") {}
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(AppColors.primaryPurple)
            }

            Button {
                dismiss()
            } label: {
                HStack(spacing: 4) {
                    Image(systemName: "arrow.left")
                    Text("Back to Log In")
                }
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(AppColors.darkText)
            }

            Spacer()
        }
        .background(.white)
        .navigationBarBackButtonHidden()
    }
}
```

- [ ] **Step 5: Create EmailVerificationView.swift**

```swift
// PathWise-iOS/PathWise/Features/Auth/EmailVerificationView.swift
import SwiftUI

struct EmailVerificationView: View {
    let email: String
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            ZStack {
                RoundedRectangle(cornerRadius: 16)
                    .fill(.white)
                    .frame(width: 80, height: 80)
                    .shadow(color: .black.opacity(0.06), radius: 4)
                Image(systemName: "envelope.fill")
                    .font(.system(size: 36))
                    .foregroundStyle(AppColors.primaryPurple)
                Image(systemName: "sparkle")
                    .font(.system(size: 12))
                    .foregroundStyle(AppColors.tealLight)
                    .offset(x: 30, y: -25)
            }

            Text("Verify your email")
                .font(AppTypography.title2)
                .foregroundStyle(AppColors.darkText)

            Text("We've sent a magic link to **\(email)** to confirm your account.")
                .font(AppTypography.callout)
                .foregroundStyle(AppColors.grayText)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)

            OutlinedButton(title: "Open Email App", icon: "envelope") {
                if let url = URL(string: "message://") {
                    UIApplication.shared.open(url)
                }
            }
            .padding(.horizontal, AppTheme.screenPadding)

            VStack(spacing: 8) {
                Text("Didn't receive the email?")
                    .font(AppTypography.callout)
                    .foregroundStyle(AppColors.grayText)
                Button("Resend Verification") {}
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(AppColors.primaryPurple)
            }

            Button {
                dismiss()
            } label: {
                Text("Back to sign in")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundStyle(AppColors.darkText)
            }

            Spacer()
        }
        .background(AppColors.lavenderBg)
    }
}
```

- [ ] **Step 6: Commit**

```bash
git add PathWise-iOS/PathWise/Features/Auth/
git commit -m "feat(ios): add auth screens — sign in, sign up, forgot password, reset sent, email verification"
```

---

## Task 9: Profile Setup Flow

**Files:**
- Create: `PathWise-iOS/PathWise/Features/ProfileSetup/ProfileSetupFlow.swift`
- Create: `PathWise-iOS/PathWise/Features/ProfileSetup/AboutYouView.swift`
- Create: `PathWise-iOS/PathWise/Features/ProfileSetup/YourGoalsView.swift`
- Create: `PathWise-iOS/PathWise/Features/ProfileSetup/PhotoUploadView.swift`

This task creates the 3-screen profile setup flow. Full code for each view is in the spec at sections 4.8-4.10 of the design doc. Implementation follows the same pattern as auth screens — SwiftUI views with stitch-matching layout.

- [ ] **Step 1: Create ProfileSetupFlow.swift** — navigation container for the 3 steps
- [ ] **Step 2: Create AboutYouView.swift** — step 1/2: current role, experience dropdown, education dropdown, industry chip multi-select, progress bar, mentor tip card
- [ ] **Step 3: Create YourGoalsView.swift** — step 2/2: role chips, timeline selector (3m/6m/1y/Not sure), values 2x2 grid (SALARY/GROWTH/BALANCE/IMPACT), "Start My Assessment" CTA
- [ ] **Step 4: Create PhotoUploadView.swift** — circular avatar placeholder, camera overlay, "Take Photo" + "Choose from Library" buttons, "Skip for now"
- [ ] **Step 5: Commit**

```bash
git add PathWise-iOS/PathWise/Features/ProfileSetup/
git commit -m "feat(ios): add profile setup flow — about you, goals, photo upload"
```

---

## Task 10: Assessment Flow

**Files:**
- Create: `PathWise-iOS/PathWise/Features/Assessment/AssessmentViewModel.swift`
- Create: `PathWise-iOS/PathWise/Features/Assessment/AssessmentIntroView.swift`
- Create: `PathWise-iOS/PathWise/Features/Assessment/AssessmentQuestionView.swift`
- Create: `PathWise-iOS/PathWise/Features/Assessment/AssessmentProcessingView.swift`
- Create: `PathWise-iOS/PathWise/Features/Assessment/AssessmentResultsView.swift`
- Create: `PathWise-iOS/PathWiseTests/Features/AssessmentViewModelTests.swift`

- [ ] **Step 1: Create AssessmentViewModel.swift** — manages question state, answer collection, submission to `POST /assessment`, stores results

```swift
// PathWise-iOS/PathWise/Features/Assessment/AssessmentViewModel.swift
import Foundation

@Observable
class AssessmentViewModel {
    let api: APIClient
    let userId: String

    var currentStep = 0
    var answers: [String: String] = [:]
    var selectedOptions: [Int: Int] = [:] // step -> selected index
    var isProcessing = false
    var processingProgress: Double = 0
    var processingStep = 0
    var result: AssessmentResult?
    var error: String?

    // Assessment question data
    let questions: [AssessmentQuestion] = AssessmentQuestion.all

    init(api: APIClient, userId: String) {
        self.api = api
        self.userId = userId
    }

    var totalQuestions: Int { questions.count }
    var currentQuestion: AssessmentQuestion? {
        guard currentStep < questions.count else { return nil }
        return questions[currentStep]
    }

    var canContinue: Bool {
        selectedOptions[currentStep] != nil
    }

    func selectOption(_ index: Int) {
        selectedOptions[currentStep] = index
        if let q = currentQuestion {
            answers[q.key] = q.options[index].value
        }
    }

    func next() {
        if currentStep < questions.count - 1 {
            currentStep += 1
        } else {
            submit()
        }
    }

    func previous() {
        if currentStep > 0 {
            currentStep -= 1
        }
    }

    private func submit() {
        isProcessing = true
        processingProgress = 0
        processingStep = 0

        Task {
            // Animate processing steps
            for step in 0..<3 {
                try? await Task.sleep(for: .seconds(1))
                await MainActor.run {
                    processingStep = step + 1
                    processingProgress = Double(step + 1) / 4.0
                }
            }

            do {
                let request = SubmitAssessmentRequest(
                    userId: userId,
                    workStyle: answers["workStyle"] ?? "",
                    strengths: extractList("strengths"),
                    values: extractList("values"),
                    currentSkills: extractList("skills"),
                    experienceLevel: answers["experienceLevel"] ?? "mid",
                    interests: extractList("interests"),
                    currentRole: answers["currentRole"],
                    personalityType: nil,
                    rawAnswers: answers
                )

                let response: AssessmentResponse = try await api.request(.submitAssessment, body: request)
                await MainActor.run {
                    result = response.result
                    processingProgress = 1.0
                    isProcessing = false
                }
            } catch {
                await MainActor.run {
                    self.error = error.localizedDescription
                    isProcessing = false
                }
            }
        }
    }

    private func extractList(_ prefix: String) -> [String] {
        answers.filter { $0.key.hasPrefix(prefix) }.map(\.value)
    }
}

struct AssessmentQuestion: Identifiable {
    let id = UUID()
    let key: String
    let category: String
    let text: String
    let options: [AssessmentOption]

    static let all: [AssessmentQuestion] = [
        AssessmentQuestion(
            key: "interests_1",
            category: "Interests",
            text: "Which of these activities energizes you most?",
            options: [
                AssessmentOption(text: "Analyzing trends in data", value: "analytical", icon: "chart.bar"),
                AssessmentOption(text: "Presenting ideas to a team", value: "social", icon: "person.3"),
                AssessmentOption(text: "Designing visual layouts", value: "creative", icon: "paintpalette"),
                AssessmentOption(text: "Writing strategic plans", value: "strategic", icon: "doc.text"),
            ]
        ),
        AssessmentQuestion(
            key: "interests_2",
            category: "Interests",
            text: "What type of problem do you enjoy solving?",
            options: [
                AssessmentOption(text: "Optimizing systems and processes", value: "systems", icon: "gearshape.2"),
                AssessmentOption(text: "Understanding people and behavior", value: "human", icon: "brain.head.profile"),
                AssessmentOption(text: "Building something from scratch", value: "builder", icon: "hammer"),
                AssessmentOption(text: "Finding patterns in complexity", value: "pattern", icon: "square.grid.3x3"),
            ]
        ),
        AssessmentQuestion(
            key: "interests_3",
            category: "Interests",
            text: "Which scenario excites you most?",
            options: [
                AssessmentOption(text: "Launching a product to market", value: "launcher", icon: "rocket"),
                AssessmentOption(text: "Mentoring a junior colleague", value: "mentor", icon: "person.badge.plus"),
                AssessmentOption(text: "Deep-diving into a research paper", value: "researcher", icon: "book"),
                AssessmentOption(text: "Negotiating a partnership deal", value: "negotiator", icon: "handshake"),
            ]
        ),
        AssessmentQuestion(
            key: "workStyle_1",
            category: "Work Style",
            text: "How do you prefer to make decisions?",
            options: [
                AssessmentOption(text: "Data-driven analysis", value: "data-driven", icon: "chart.pie"),
                AssessmentOption(text: "Gut feeling and intuition", value: "intuitive", icon: "sparkles"),
                AssessmentOption(text: "Group consensus", value: "collaborative", icon: "bubble.left.and.bubble.right"),
                AssessmentOption(text: "Expert consultation", value: "consultative", icon: "person.wave.2"),
            ]
        ),
        AssessmentQuestion(
            key: "workStyle_2",
            category: "Work Style",
            text: "What's your ideal team dynamic?",
            options: [
                AssessmentOption(text: "Independent work with check-ins", value: "independent", icon: "person"),
                AssessmentOption(text: "Highly collaborative, always pairing", value: "pair", icon: "person.2"),
                AssessmentOption(text: "Small focused squad", value: "squad", icon: "person.3"),
                AssessmentOption(text: "Leading a large team", value: "leader", icon: "person.3.sequence"),
            ]
        ),
        AssessmentQuestion(
            key: "workStyle_3",
            category: "Work Style",
            text: "How do you handle ambiguity?",
            options: [
                AssessmentOption(text: "Create structure and process", value: "structured", icon: "list.bullet.rectangle"),
                AssessmentOption(text: "Embrace it and experiment", value: "explorer", icon: "safari"),
                AssessmentOption(text: "Seek clarity before acting", value: "clarifier", icon: "magnifyingglass"),
                AssessmentOption(text: "Take decisive action quickly", value: "decisive", icon: "bolt"),
            ]
        ),
        AssessmentQuestion(
            key: "workStyle_4",
            category: "Work Style",
            text: "What pace energizes you?",
            options: [
                AssessmentOption(text: "Fast-paced startup energy", value: "fast", icon: "hare"),
                AssessmentOption(text: "Steady, sustainable rhythm", value: "steady", icon: "metronome"),
                AssessmentOption(text: "Deep focus, few interruptions", value: "deep", icon: "moon.stars"),
                AssessmentOption(text: "Varied — different every day", value: "varied", icon: "shuffle"),
            ]
        ),
        AssessmentQuestion(
            key: "values_1",
            category: "Values",
            text: "What matters most in your career?",
            options: [
                AssessmentOption(text: "Financial security and growth", value: "financial", icon: "dollarsign.circle"),
                AssessmentOption(text: "Making a positive impact", value: "impact", icon: "heart"),
                AssessmentOption(text: "Continuous learning", value: "learning", icon: "graduationcap"),
                AssessmentOption(text: "Work-life balance", value: "balance", icon: "scale.3d"),
            ]
        ),
        AssessmentQuestion(
            key: "values_2",
            category: "Values",
            text: "What frustrates you most at work?",
            options: [
                AssessmentOption(text: "Bureaucracy and red tape", value: "bureaucracy", icon: "exclamationmark.triangle"),
                AssessmentOption(text: "Lack of creative freedom", value: "freedom", icon: "lock"),
                AssessmentOption(text: "Poor communication", value: "communication", icon: "bubble.left.and.exclamationmark.bubble.right"),
                AssessmentOption(text: "Stagnation and no growth", value: "stagnation", icon: "arrow.down.right"),
            ]
        ),
        AssessmentQuestion(
            key: "values_3",
            category: "Values",
            text: "Which trade-off would you accept?",
            options: [
                AssessmentOption(text: "Less pay for more meaning", value: "meaning-over-pay", icon: "heart.circle"),
                AssessmentOption(text: "More stress for faster growth", value: "growth-over-comfort", icon: "arrow.up.forward"),
                AssessmentOption(text: "Less prestige for more freedom", value: "freedom-over-prestige", icon: "bird"),
                AssessmentOption(text: "More routine for more stability", value: "stability-over-variety", icon: "house"),
            ]
        ),
        AssessmentQuestion(
            key: "values_4",
            category: "Values",
            text: "What reward feels most satisfying?",
            options: [
                AssessmentOption(text: "Public recognition", value: "recognition", icon: "star"),
                AssessmentOption(text: "Solving a hard problem", value: "mastery", icon: "puzzlepiece"),
                AssessmentOption(text: "Helping someone succeed", value: "helping", icon: "hands.sparkles"),
                AssessmentOption(text: "Building something lasting", value: "legacy", icon: "building.columns"),
            ]
        ),
        AssessmentQuestion(
            key: "environment_1",
            category: "Environment",
            text: "What's your ideal work setting?",
            options: [
                AssessmentOption(text: "Fully remote", value: "remote", icon: "house.lodge"),
                AssessmentOption(text: "Hybrid (mix of home and office)", value: "hybrid", icon: "arrow.triangle.swap"),
                AssessmentOption(text: "In-office with colleagues", value: "office", icon: "building.2"),
                AssessmentOption(text: "On-site / fieldwork", value: "fieldwork", icon: "map"),
            ]
        ),
        AssessmentQuestion(
            key: "environment_2",
            category: "Environment",
            text: "What team size do you prefer?",
            options: [
                AssessmentOption(text: "Solo or 2-3 people", value: "tiny", icon: "person"),
                AssessmentOption(text: "Small team (4-8)", value: "small", icon: "person.2"),
                AssessmentOption(text: "Medium team (9-20)", value: "medium", icon: "person.3"),
                AssessmentOption(text: "Large organization (20+)", value: "large", icon: "person.3.sequence"),
            ]
        ),
        AssessmentQuestion(
            key: "environment_3",
            category: "Environment",
            text: "What management style suits you?",
            options: [
                AssessmentOption(text: "Hands-off — trust me to deliver", value: "autonomous", icon: "hand.raised.slash"),
                AssessmentOption(text: "Regular check-ins and feedback", value: "coaching", icon: "bubble.left.and.bubble.right"),
                AssessmentOption(text: "Clear structure and expectations", value: "structured", icon: "checklist"),
                AssessmentOption(text: "Collaborative — manager as partner", value: "partner", icon: "person.2.circle"),
            ]
        ),
        AssessmentQuestion(
            key: "environment_4",
            category: "Environment",
            text: "How important is company culture?",
            options: [
                AssessmentOption(text: "Critical — it's my top priority", value: "critical", icon: "heart.fill"),
                AssessmentOption(text: "Important, but role matters more", value: "important", icon: "star.leadinghalf.filled"),
                AssessmentOption(text: "Nice to have", value: "moderate", icon: "hand.thumbsup"),
                AssessmentOption(text: "I focus on the work itself", value: "work-focused", icon: "briefcase"),
            ]
        ),
        AssessmentQuestion(
            key: "career_1",
            category: "Career Stage",
            text: "Where are you in your career?",
            options: [
                AssessmentOption(text: "Just starting out", value: "entry", icon: "sunrise"),
                AssessmentOption(text: "Early career (1-3 years)", value: "early", icon: "sun.max"),
                AssessmentOption(text: "Mid-career (4-8 years)", value: "mid", icon: "sun.haze"),
                AssessmentOption(text: "Senior / leadership (8+ years)", value: "senior", icon: "crown"),
            ]
        ),
        AssessmentQuestion(
            key: "career_2",
            category: "Career Stage",
            text: "What's your risk tolerance for career moves?",
            options: [
                AssessmentOption(text: "High — I'll bet on myself", value: "high-risk", icon: "flame"),
                AssessmentOption(text: "Moderate — calculated risks", value: "moderate-risk", icon: "scale.3d"),
                AssessmentOption(text: "Low — prefer stability", value: "low-risk", icon: "shield"),
                AssessmentOption(text: "Depends on the opportunity", value: "situational", icon: "questionmark.circle"),
            ]
        ),
        AssessmentQuestion(
            key: "career_3",
            category: "Career Stage",
            text: "What career trajectory appeals to you?",
            options: [
                AssessmentOption(text: "Individual contributor / expert", value: "ic", icon: "star.circle"),
                AssessmentOption(text: "People manager / leader", value: "manager", icon: "person.3.fill"),
                AssessmentOption(text: "Entrepreneur / founder", value: "founder", icon: "lightbulb"),
                AssessmentOption(text: "Freelance / independent", value: "freelance", icon: "figure.walk"),
            ]
        ),
        AssessmentQuestion(
            key: "career_4",
            category: "Career Stage",
            text: "In a group project, what's your natural role?",
            options: [
                AssessmentOption(text: "The strategist — planning the approach", value: "strategist", icon: "map"),
                AssessmentOption(text: "The executor — getting things done", value: "executor", icon: "hammer"),
                AssessmentOption(text: "The connector — bringing people together", value: "connector", icon: "link"),
                AssessmentOption(text: "The innovator — generating ideas", value: "innovator", icon: "lightbulb"),
            ]
        ),
        AssessmentQuestion(
            key: "skills_experience",
            category: "Skills & Experience",
            text: "What's your experience level?",
            options: [
                AssessmentOption(text: "Student / Career changer", value: "beginner", icon: "book"),
                AssessmentOption(text: "Junior (0-2 years)", value: "junior", icon: "leaf"),
                AssessmentOption(text: "Mid-level (3-5 years)", value: "mid", icon: "tree"),
                AssessmentOption(text: "Senior (6+ years)", value: "senior", icon: "mountain.2"),
            ]
        ),
    ]
}

struct AssessmentOption: Identifiable {
    let id = UUID()
    let text: String
    let value: String
    let icon: String
}
```

- [ ] **Step 2: Create AssessmentIntroView.swift** — brain/gear icon, heading, 3 info badges (~5 min, 32 questions, AI-analyzed), "Begin Assessment" CTA, "I'll do this later" link

- [ ] **Step 3: Create AssessmentQuestionView.swift** — progress bar with category + question count, question heading, 4 answer cards (icon on light purple bg + text, selected = purple border + teal checkmark), "Continue" CTA (disabled until selection), back/skip in toolbar

- [ ] **Step 4: Create AssessmentProcessingView.swift** — spinning teal ring with PathWise icon, "ETHEREAL MENTOR AI" label, 3 sequential processing steps, progress bar 0→100%, bottom icons (COGNITIVE/EXPERIENCE/TRAJECTORY), tappable when done

- [ ] **Step 5: Create AssessmentResultsView.swift** — top match donut chart, "BEST MATCH" green badge, role name, teal-to-purple "View My Roadmap" CTA, "Retake Assessment" link, "Other Strong Paths" section with 2 additional matches

- [ ] **Step 6: Write AssessmentViewModel test**

```swift
// PathWise-iOS/PathWiseTests/Features/AssessmentViewModelTests.swift
import XCTest
@testable import PathWise

final class AssessmentViewModelTests: XCTestCase {
    func testInitialState() {
        let vm = AssessmentViewModel(api: APIClient(), userId: "test-user")
        XCTAssertEqual(vm.currentStep, 0)
        XCTAssertFalse(vm.canContinue)
        XCTAssertFalse(vm.isProcessing)
        XCTAssertNil(vm.result)
        XCTAssertEqual(vm.totalQuestions, 20)
    }

    func testSelectOptionEnablesContinue() {
        let vm = AssessmentViewModel(api: APIClient(), userId: "test-user")
        vm.selectOption(0)
        XCTAssertTrue(vm.canContinue)
    }

    func testNextAdvancesStep() {
        let vm = AssessmentViewModel(api: APIClient(), userId: "test-user")
        vm.selectOption(1)
        vm.next()
        XCTAssertEqual(vm.currentStep, 1)
    }

    func testPreviousGoesBack() {
        let vm = AssessmentViewModel(api: APIClient(), userId: "test-user")
        vm.selectOption(0)
        vm.next()
        vm.previous()
        XCTAssertEqual(vm.currentStep, 0)
    }

    func testPreviousAtZeroStaysAtZero() {
        let vm = AssessmentViewModel(api: APIClient(), userId: "test-user")
        vm.previous()
        XCTAssertEqual(vm.currentStep, 0)
    }
}
```

- [ ] **Step 7: Commit**

```bash
git add PathWise-iOS/PathWise/Features/Assessment/ PathWise-iOS/PathWiseTests/Features/AssessmentViewModelTests.swift
git commit -m "feat(ios): add assessment flow — intro, questions, processing, results"
```

---

## Task 11: Dashboard

**Files:**
- Create: `PathWise-iOS/PathWise/Features/Dashboard/DashboardViewModel.swift`
- Create: `PathWise-iOS/PathWise/Features/Dashboard/DashboardView.swift`
- Create: `PathWise-iOS/PathWiseTests/Features/DashboardViewModelTests.swift`

- [ ] **Step 1: Create DashboardViewModel.swift** — loads assessment, progress, roadmap data from API; exposes `hasAssessment`, `progressStats`, `careerMatches`, `roadmap`
- [ ] **Step 2: Create DashboardView.swift** — two modes:
  - **Pre-assessment**: "Welcome, Emily!" heading, compass illustration card, locked content, methodology section, fast-track banner, "Start Assessment" CTA
  - **Post-assessment**: purple gradient welcome banner with assessment status + "VIEW MY ROADMAP" button, 3 metric cards (Roadmap Completion %, Tasks Finished, Job Readiness %), "Top Career Matches" section with 3 donut chart cards + "View Details" buttons
- [ ] **Step 3: Write DashboardViewModel test** — verify loading states, data mapping
- [ ] **Step 4: Commit**

```bash
git add PathWise-iOS/PathWise/Features/Dashboard/ PathWise-iOS/PathWiseTests/Features/DashboardViewModelTests.swift
git commit -m "feat(ios): add dashboard — pre and post assessment views"
```

---

## Task 12: Roadmap

**Files:**
- Create: `PathWise-iOS/PathWise/Features/Roadmap/RoadmapViewModel.swift`
- Create: `PathWise-iOS/PathWise/Features/Roadmap/RoadmapView.swift`
- Create: `PathWise-iOS/PathWise/Features/Roadmap/AdjustTimelineSheet.swift`
- Create: `PathWise-iOS/PathWise/Features/Roadmap/CourseDetailView.swift`
- Create: `PathWise-iOS/PathWise/Features/Roadmap/ProjectDetailView.swift`
- Create: `PathWise-iOS/PathWise/Features/Roadmap/NetworkingDetailView.swift`
- Create: `PathWise-iOS/PathWiseTests/Features/RoadmapViewModelTests.swift`

- [ ] **Step 1: Create RoadmapViewModel.swift** — loads roadmap + tasks + assessment; groups tasks by category (courses/projects/networking); handles milestone completion, timeline adjustment
- [ ] **Step 2: Create RoadmapView.swift** — target header card (CURRENT TARGET, role, progress ring, timeline/track chips, "Adjust Timeline" + "Add Custom Task" buttons), skill gap indicator card, My Learning Path (COURSES/PROJECTS/NETWORKING sections with priority badges and colored left borders)
- [ ] **Step 3: Create AdjustTimelineSheet.swift** — bottom sheet with 4 timeline options (3m/6m/9m/12m cards with RECOMMENDED badge on 6m), weekly time estimate, "Update Timeline" CTA
- [ ] **Step 4: Create CourseDetailView.swift** — dark header card with progress, module curriculum list (completed/current/locked states), "Continue Learning" CTA
- [ ] **Step 5: Create ProjectDetailView.swift** — header with priority badge, objectives checklist, time/skills info cards, resources section, "Mark as Complete" CTA
- [ ] **Step 6: Create NetworkingDetailView.swift** — contact tracker forms, conversation starter card (teal bg), pro tips card (amber bg), progress bar
- [ ] **Step 7: Write RoadmapViewModel test**
- [ ] **Step 8: Commit**

```bash
git add PathWise-iOS/PathWise/Features/Roadmap/ PathWise-iOS/PathWiseTests/Features/RoadmapViewModelTests.swift
git commit -m "feat(ios): add roadmap — path view, timeline sheet, course/project/networking detail"
```

---

## Task 13: Tasks

**Files:**
- Create: `PathWise-iOS/PathWise/Features/Tasks/TasksViewModel.swift`
- Create: `PathWise-iOS/PathWise/Features/Tasks/TasksView.swift`
- Create: `PathWise-iOS/PathWise/Features/Tasks/TaskCelebrationView.swift`
- Create: `PathWise-iOS/PathWiseTests/Features/TasksViewModelTests.swift`

- [ ] **Step 1: Create TasksViewModel.swift** — loads tasks from API, filters by daily/weekly, handles status updates (todo→in_progress→done), detects all-tasks-done for celebration, creates tasks
- [ ] **Step 2: Create TasksView.swift** — "Stay on track with today's priorities" heading, target info bar (role + progress %), progress bar, Daily/Weekly segmented control, task list (circle checkbox + title + duration/category + chevron), "COMPLETE TASKS" CTA, estimated time footer. Empty state when no tasks.
- [ ] **Step 3: Create TaskCelebrationView.swift** — trophy icon, "Great work, Emily!" heading, 2 stat cards (Growth +5% readiness, Consistency streak), weekly goal card with progress, "View Tomorrow's Tasks" CTA + "Back to Home" link
- [ ] **Step 4: Write TasksViewModel test** — verify filtering, status transitions, completion detection
- [ ] **Step 5: Commit**

```bash
git add PathWise-iOS/PathWise/Features/Tasks/ PathWise-iOS/PathWiseTests/Features/TasksViewModelTests.swift
git commit -m "feat(ios): add tasks — daily/weekly view, celebration, empty state"
```

---

## Task 14: Progress Dashboard

**Files:**
- Create: `PathWise-iOS/PathWise/Features/Progress/ProgressViewModel.swift`
- Create: `PathWise-iOS/PathWise/Features/Progress/ProgressDashboardView.swift`

- [ ] **Step 1: Create ProgressViewModel.swift** — loads stats from `GET /progress/:userId`
- [ ] **Step 2: Create ProgressDashboardView.swift** — large donut chart (73% READY), trend badge (+12%), tasks summary card (X/Y + progress bar), roadmap completion card, 4 skill progress bars
- [ ] **Step 3: Commit**

```bash
git add PathWise-iOS/PathWise/Features/Progress/
git commit -m "feat(ios): add progress dashboard with readiness score and skill bars"
```

---

## Task 15: Streaks and Achievements

**Files:**
- Create: `PathWise-iOS/PathWise/Features/Streaks/StreaksViewModel.swift`
- Create: `PathWise-iOS/PathWise/Features/Streaks/StreakTrackerView.swift`
- Create: `PathWise-iOS/PathWise/Features/Achievements/AchievementsViewModel.swift`
- Create: `PathWise-iOS/PathWise/Features/Achievements/AchievementsView.swift`

- [ ] **Step 1: Create StreaksViewModel.swift** — loads streak data, records activity
- [ ] **Step 2: Create StreakTrackerView.swift** — "Momentum" heading, streak card (flame + count + best), weekly progress day circles (M-S with checkmark/lightning/empty states), power hour card (purple gradient), consistency score + bar, "Complete Today's Tasks" teal CTA
- [ ] **Step 3: Create AchievementsViewModel.swift** — loads achievements, XP, season progress
- [ ] **Step 4: Create AchievementsView.swift** — season progress card (dark purple gradient, XP bar), badge count, 2-column grid (earned = colored with date, locked = grayed with requirement + progress fraction)
- [ ] **Step 5: Commit**

```bash
git add PathWise-iOS/PathWise/Features/Streaks/ PathWise-iOS/PathWise/Features/Achievements/
git commit -m "feat(ios): add streak tracker and achievements screen"
```

---

## Task 16: Career Match Detail

**Files:**
- Create: `PathWise-iOS/PathWise/Features/CareerMatch/CareerMatchDetailView.swift`

- [ ] **Step 1: Create CareerMatchDetailView.swift** — large donut chart (88% MATCH), "BEST MATCH" badge, role description, "Why this fits you" section (3 bullet points with green checkmarks), salary benchmarks card (LOW/MEDIAN/HIGH), skills readiness section (3 skills with EXPERT green / MODERATE amber / GAP red badges), "Set as My Target Role" CTA, "Compare with another role" link
- [ ] **Step 2: Commit**

```bash
git add PathWise-iOS/PathWise/Features/CareerMatch/
git commit -m "feat(ios): add career match detail view"
```

---

## Task 17: Notifications, Search, Certificates

**Files:**
- Create: `PathWise-iOS/PathWise/Features/Notifications/NotificationsViewModel.swift`
- Create: `PathWise-iOS/PathWise/Features/Notifications/NotificationsView.swift`
- Create: `PathWise-iOS/PathWise/Features/Search/SearchViewModel.swift`
- Create: `PathWise-iOS/PathWise/Features/Search/SearchView.swift`
- Create: `PathWise-iOS/PathWise/Features/Certificates/CertificatesViewModel.swift`
- Create: `PathWise-iOS/PathWise/Features/Certificates/CertificatesView.swift`

- [ ] **Step 1: Create NotificationsViewModel + NotificationsView** — "MARK ALL AS READ" action, Today section (3 NEW badge) with colored accent notification cards + unread dots, Earlier section, END OF FEED footer
- [ ] **Step 2: Create SearchViewModel + SearchView** — search bar with clear button, results grouped by Roles (match score), Courses (module count), Skills (chip tags)
- [ ] **Step 3: Create CertificatesViewModel + CertificatesView** — "Add Certificate" button, certificate cards (provider logo, name, VERIFIED badge, View/Share links), add form sheet, promo card
- [ ] **Step 4: Commit**

```bash
git add PathWise-iOS/PathWise/Features/Notifications/ PathWise-iOS/PathWise/Features/Search/ PathWise-iOS/PathWise/Features/Certificates/
git commit -m "feat(ios): add notifications, search, and certificates screens"
```

---

## Task 18: Settings, Edit Profile, Change Target Role

**Files:**
- Create: `PathWise-iOS/PathWise/Features/Settings/SettingsViewModel.swift`
- Create: `PathWise-iOS/PathWise/Features/Settings/SettingsView.swift`
- Create: `PathWise-iOS/PathWise/Features/Settings/EditProfileView.swift`
- Create: `PathWise-iOS/PathWise/Features/Settings/ChangeTargetRoleView.swift`

- [ ] **Step 1: Create SettingsViewModel.swift** — manages preference toggles, logout
- [ ] **Step 2: Create SettingsView.swift** — profile card (PREMIUM MEMBER label, name, target role, Edit Profile button), goal timeline progress, assessment card (Retake Assessment link), premium plan card (purple gradient), preferences toggles (Push Notifications, Daily Reminders, Weekly Reports), navigation links (Change Target Role, Security & Privacy), Log Out (red)
- [ ] **Step 3: Create EditProfileView.swift** — circular photo with camera overlay, form fields (name, email, role, industry dropdown, experience slider, bio textarea), "Save Changes" CTA, danger zone (Delete Account red)
- [ ] **Step 4: Create ChangeTargetRoleView.swift** — warning card (amber, "Changing role will reset roadmap"), current role card with CURRENT badge, radio-button role options from assessment matches, "Change Target Role" outlined CTA, disclaimer text
- [ ] **Step 5: Commit**

```bash
git add PathWise-iOS/PathWise/Features/Settings/
git commit -m "feat(ios): add settings, edit profile, and change target role"
```

---

## Task 19: Help & FAQ

**Files:**
- Create: `PathWise-iOS/PathWise/Features/Help/HelpFAQView.swift`

- [ ] **Step 1: Create HelpFAQView.swift** — "How can we help?" heading, search bar, accordion sections (Getting Started, Roadmap & Tasks, Billing) using `DisclosureGroup`, expandable Q&A items, support card ("Still have questions?" + "Contact Support" button)
- [ ] **Step 2: Commit**

```bash
git add PathWise-iOS/PathWise/Features/Help/
git commit -m "feat(ios): add help and FAQ screen"
```

---

## Task 20: Wire Up ContentView with Full Navigation Flow

**Files:**
- Modify: `PathWise-iOS/PathWise/ContentView.swift`
- Modify: `PathWise-iOS/PathWise/PathWiseApp.swift`

- [ ] **Step 1: Update ContentView.swift** — full auth flow: SplashView → (if first launch) OnboardingCarouselView → (if not authenticated) SignInView → (if authenticated) MainTabView. Track first launch with `@AppStorage("hasSeenOnboarding")`.

```swift
// PathWise-iOS/PathWise/ContentView.swift
import SwiftUI

struct ContentView: View {
    @Environment(AuthManager.self) private var authManager
    @AppStorage("hasSeenOnboarding") private var hasSeenOnboarding = false
    @State private var showSplash = true
    @State private var showOnboarding = false

    var body: some View {
        ZStack {
            if showSplash {
                SplashView()
                    .onAppear {
                        Task {
                            await authManager.checkSession()
                            try? await Task.sleep(for: .seconds(2))
                            withAnimation(.easeInOut(duration: 0.5)) {
                                showSplash = false
                                if !hasSeenOnboarding {
                                    showOnboarding = true
                                }
                            }
                        }
                    }
            } else if showOnboarding {
                OnboardingCarouselView(showOnboarding: Binding(
                    get: { showOnboarding },
                    set: { val in
                        withAnimation {
                            showOnboarding = val
                            hasSeenOnboarding = true
                        }
                    }
                ))
            } else if authManager.isAuthenticated {
                MainTabView()
            } else {
                SignInView()
            }
        }
    }
}
```

- [ ] **Step 2: Verify PathWiseApp.swift passes AuthManager through environment**

```swift
// PathWise-iOS/PathWise/PathWiseApp.swift
import SwiftUI

@main
struct PathWiseApp: App {
    @State private var authManager = AuthManager()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(authManager)
        }
    }
}
```

- [ ] **Step 3: Commit**

```bash
git add PathWise-iOS/PathWise/ContentView.swift PathWise-iOS/PathWise/PathWiseApp.swift
git commit -m "feat(ios): wire up full navigation flow — splash, onboarding, auth, main app"
```

---

## Task 21: Create Xcode Project File

**Files:**
- Create: `PathWise-iOS/Package.swift` (Swift Package Manager) OR `PathWise-iOS/project.yml` (XcodeGen)

Since we can't create an .xcodeproj from the command line easily, use XcodeGen to generate it.

- [ ] **Step 1: Install XcodeGen if not present**

```bash
brew install xcodegen 2>/dev/null || echo "XcodeGen already installed or brew not available"
```

- [ ] **Step 2: Create project.yml**

```yaml
# PathWise-iOS/project.yml
name: PathWise
options:
  bundleIdPrefix: com.pathwise
  deploymentTarget:
    iOS: "17.0"
  xcodeVersion: "15.0"

targets:
  PathWise:
    type: application
    platform: iOS
    sources:
      - PathWise
    settings:
      base:
        SWIFT_VERSION: "5.9"
        TARGETED_DEVICE_FAMILY: "1,2"
        INFOPLIST_KEY_UILaunchScreen_Generation: true
        INFOPLIST_KEY_UISupportedInterfaceOrientations: "UIInterfaceOrientationPortrait"
        INFOPLIST_KEY_UISupportedInterfaceOrientations_iPad: "UIInterfaceOrientationPortrait UIInterfaceOrientationLandscapeLeft UIInterfaceOrientationLandscapeRight"

  PathWiseTests:
    type: bundle.unit-test
    platform: iOS
    sources:
      - PathWiseTests
    dependencies:
      - target: PathWise
    settings:
      base:
        SWIFT_VERSION: "5.9"
```

- [ ] **Step 3: Generate Xcode project**

```bash
cd /home/admin1/PathWise/PathWise-iOS && xcodegen generate
```

- [ ] **Step 4: Commit**

```bash
git add PathWise-iOS/project.yml PathWise-iOS/PathWise.xcodeproj/
git commit -m "feat(ios): add XcodeGen project configuration"
```

---

## Task 22: Final Integration and Smoke Test

- [ ] **Step 1: Open project in Xcode and verify it builds**

```bash
cd /home/admin1/PathWise/PathWise-iOS && xcodebuild -scheme PathWise -destination 'platform=iOS Simulator,name=iPhone 16' build 2>&1 | tail -20
```

- [ ] **Step 2: Fix any compilation errors** — resolve missing imports, type mismatches, forward declarations
- [ ] **Step 3: Run tests**

```bash
cd /home/admin1/PathWise/PathWise-iOS && xcodebuild test -scheme PathWise -destination 'platform=iOS Simulator,name=iPhone 16' 2>&1 | tail -20
```

- [ ] **Step 4: Fix any test failures**
- [ ] **Step 5: Commit**

```bash
git add -A PathWise-iOS/
git commit -m "fix(ios): resolve compilation errors and pass all tests"
```

---

## Summary

| Task | Description | Est. Files |
|------|-------------|------------|
| 1 | Xcode project scaffold + theme | 5 |
| 2 | APIClient, APIError, Endpoints | 4 |
| 3 | Auth — Keychain, AuthManager, User model | 5 |
| 4 | All remaining data models | 8 |
| 5 | Reusable UI components | 11 |
| 6 | MainTabView + Sidebar navigation | 1 |
| 7 | Splash + Onboarding | 2 |
| 8 | Auth screens (5 screens) | 5 |
| 9 | Profile setup flow (3 screens) | 4 |
| 10 | Assessment flow (4 screens + VM) | 6 |
| 11 | Dashboard (2 modes + VM) | 3 |
| 12 | Roadmap (5 screens + VM) | 7 |
| 13 | Tasks (3 screens + VM) | 4 |
| 14 | Progress dashboard | 2 |
| 15 | Streaks + Achievements | 4 |
| 16 | Career Match Detail | 1 |
| 17 | Notifications, Search, Certificates | 6 |
| 18 | Settings, Edit Profile, Change Role | 4 |
| 19 | Help & FAQ | 1 |
| 20 | Wire up ContentView | 2 |
| 21 | XcodeGen project file | 1 |
| 22 | Build verification + fixes | 0 |
| **Total** | | **~86 files** |
