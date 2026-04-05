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
                    .font(.system(size: 40)).foregroundStyle(AppColors.primaryPurple)
                    .frame(width: 64, height: 64)
                    .background(AppColors.lightPurpleTint, in: Circle())

                Text("Reset your password").font(AppTypography.title2).foregroundStyle(AppColors.darkText)

                Text("Enter the email associated with your PathWise account and we'll send a secure reset link.")
                    .font(AppTypography.callout).foregroundStyle(AppColors.grayText).multilineTextAlignment(.center).padding(.horizontal, 32)

                CardView {
                    VStack(spacing: 16) {
                        InputField(label: "EMAIL ADDRESS", icon: "envelope", placeholder: "name@career.com", text: $email)
                            .keyboardType(.emailAddress).textInputAutocapitalization(.never)
                        PillButton(title: "Send Reset Link", disabled: email.isEmpty) { showSent = true }
                    }
                }
                .padding(.horizontal, AppTheme.screenPadding)

                Button { dismiss() } label: {
                    HStack(spacing: 4) {
                        Image(systemName: "arrow.left")
                        Text("Back to Log In")
                    }
                    .font(.system(size: 14, weight: .medium)).foregroundStyle(AppColors.darkText)
                }

                Spacer()
            }
            .background(
                LinearGradient(colors: [.white, Color(hex: "FDE8E0"), AppColors.lavenderBg], startPoint: .top, endPoint: .bottom).ignoresSafeArea()
            )
            .navigationDestination(isPresented: $showSent) { ResetEmailSentView(email: email) }
        }
    }
}
