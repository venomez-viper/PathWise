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
                HStack(spacing: 6) {
                    Image(systemName: "book.fill")
                    Text("PathWise").font(.system(size: 22, weight: .bold))
                }
                .foregroundStyle(AppColors.primaryPurple)
                .padding(.top, 40)

                CardView {
                    VStack(spacing: 20) {
                        Text("Create your account").font(AppTypography.title1).foregroundStyle(AppColors.darkText)
                            .frame(maxWidth: .infinity, alignment: .center)
                        Text("Join the professional growth ecosystem.").font(AppTypography.callout).foregroundStyle(AppColors.grayText)
                            .frame(maxWidth: .infinity, alignment: .center)

                        SocialAuthButtons()

                        HStack {
                            Rectangle().fill(AppColors.lightGrayBorder).frame(height: 1)
                            Text("OR CONTINUE WITH EMAIL").capsStyle(size: 10)
                            Rectangle().fill(AppColors.lightGrayBorder).frame(height: 1)
                        }

                        InputField(label: "FULL NAME", icon: "person", placeholder: "John Doe", text: $name)
                            .textContentType(.name)
                        InputField(label: "EMAIL", icon: "envelope", placeholder: "john@company.com", text: $email)
                            .textContentType(.emailAddress).keyboardType(.emailAddress).autocapitalization(.none)
                        InputField(label: "PASSWORD", icon: "lock", placeholder: "8+ characters", text: $password, isSecure: true)
                            .textContentType(.newPassword)

                        if let error = authManager.errorMessage {
                            Text(error).font(AppTypography.callout).foregroundStyle(AppColors.errorRed)
                        }

                        PillButton(title: "Sign Up", isLoading: authManager.isLoading, disabled: name.isEmpty || email.isEmpty || password.count < 8) {
                            Task { try? await authManager.signUp(name: name, email: email, password: password) }
                        }

                        HStack(spacing: 4) {
                            Text("Already have an account?").font(AppTypography.callout).foregroundStyle(AppColors.grayText)
                            Button("Log In") { dismiss() }.font(.system(size: 14, weight: .bold)).foregroundStyle(AppColors.primaryPurple)
                        }
                    }
                }
                .padding(.horizontal, AppTheme.screenPadding)

                Text("By creating an account, you agree to PathWise's Terms of Service and Privacy Policy.")
                    .font(AppTypography.caption2).foregroundStyle(AppColors.grayText).multilineTextAlignment(.center).padding(.horizontal, 32)
            }
        }
        .background(AppColors.lavenderBg)
        .navigationBarBackButtonHidden()
        .toolbar {
            ToolbarItem(placement: .topBarLeading) {
                Button { dismiss() } label: { Image(systemName: "chevron.left").foregroundStyle(AppColors.primaryPurple) }
            }
        }
    }
}
