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
                    HStack(spacing: 6) {
                        Image(systemName: "book.fill")
                        Text("PathWise").font(.system(size: 22, weight: .bold))
                    }
                    .foregroundStyle(AppColors.primaryPurple)
                    .padding(.top, 40)

                    CardView {
                        VStack(alignment: .leading, spacing: 20) {
                            Text("Welcome back").font(AppTypography.title1).foregroundStyle(AppColors.darkText)
                            Text("Continue your journey to career mastery.").font(AppTypography.callout).foregroundStyle(AppColors.grayText)

                            InputField(label: "EMAIL ADDRESS", icon: "envelope", placeholder: "name@example.com", text: $email)
                                .textContentType(.emailAddress)
                                .keyboardType(.emailAddress)
                                .autocapitalization(.none)

                            VStack(alignment: .leading, spacing: 6) {
                                HStack {
                                    Text("PASSWORD").capsStyle(size: 11, color: AppColors.darkText)
                                    Spacer()
                                    Button("Forgot password?") { showForgotPassword = true }
                                        .font(.system(size: 12, weight: .medium)).foregroundStyle(AppColors.primaryPurple)
                                }
                                InputField(label: "", icon: "lock", placeholder: "Enter password", text: $password, isSecure: true)
                            }

                            if let error = authManager.errorMessage {
                                Text(error).font(AppTypography.callout).foregroundStyle(AppColors.errorRed)
                            }

                            PillButton(title: "Log In", icon: "arrow.right", isLoading: authManager.isLoading) {
                                Task { try? await authManager.signIn(email: email, password: password) }
                            }

                            HStack {
                                Rectangle().fill(AppColors.lightGrayBorder).frame(height: 1)
                                Text("OR CONTINUE WITH").capsStyle(size: 10)
                                Rectangle().fill(AppColors.lightGrayBorder).frame(height: 1)
                            }

                            SocialAuthButtons()

                            HStack(spacing: 4) {
                                Text("Don't have an account?").font(AppTypography.callout).foregroundStyle(AppColors.grayText)
                                Button("Sign Up") { showSignUp = true }
                                    .font(.system(size: 14, weight: .bold)).foregroundStyle(AppColors.primaryPurple)
                            }
                            .frame(maxWidth: .infinity, alignment: .center)
                        }
                    }
                    .padding(.horizontal, AppTheme.screenPadding)
                }
            }
            .background(AppColors.lavenderBg)
            .navigationDestination(isPresented: $showSignUp) { SignUpView() }
            .sheet(isPresented: $showForgotPassword) { ForgotPasswordView() }
        }
    }
}
