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
