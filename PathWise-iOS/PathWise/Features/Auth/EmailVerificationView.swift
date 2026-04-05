import SwiftUI

struct EmailVerificationView: View {
    let email: String
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            ZStack {
                RoundedRectangle(cornerRadius: 16).fill(.white).frame(width: 80, height: 80).shadow(color: .black.opacity(0.06), radius: 4)
                Image(systemName: "envelope.fill").font(.system(size: 36)).foregroundStyle(AppColors.primaryPurple)
                Image(systemName: "sparkle").font(.system(size: 12)).foregroundStyle(AppColors.tealLight).offset(x: 30, y: -25)
            }

            Text("Verify your email").font(AppTypography.title2).foregroundStyle(AppColors.darkText)
            Text("We've sent a magic link to **\(email)** to confirm your account.")
                .font(AppTypography.callout).foregroundStyle(AppColors.grayText).multilineTextAlignment(.center).padding(.horizontal, 32)

            OutlinedButton(title: "Open Email App", icon: "envelope") {
                if let url = URL(string: "message://") { UIApplication.shared.open(url) }
            }
            .padding(.horizontal, AppTheme.screenPadding)

            VStack(spacing: 8) {
                Text("Didn't receive the email?").font(AppTypography.callout).foregroundStyle(AppColors.grayText)
                Button("Resend Verification") {}.font(.system(size: 14, weight: .bold)).foregroundStyle(AppColors.primaryPurple)
            }

            Button { dismiss() } label: {
                Text("Back to sign in").font(.system(size: 14, weight: .medium)).foregroundStyle(AppColors.darkText)
            }

            Spacer()
        }
        .background(AppColors.lavenderBg)
    }
}
