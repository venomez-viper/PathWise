import SwiftUI

struct ResetEmailSentView: View {
    let email: String
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            ZStack(alignment: .bottomTrailing) {
                Image(systemName: "envelope.fill").font(.system(size: 48)).foregroundStyle(AppColors.primaryPurple)
                Image(systemName: "checkmark.circle.fill").font(.system(size: 20)).foregroundStyle(AppColors.successGreen).offset(x: 8, y: 4)
            }

            Text("Check your inbox").font(AppTypography.title2).foregroundStyle(AppColors.darkText)
            Text("We've sent a password reset link to **\(email)**")
                .font(AppTypography.callout).foregroundStyle(AppColors.grayText).multilineTextAlignment(.center).padding(.horizontal, 32)

            OutlinedButton(title: "Open Email App", icon: "envelope") {
                if let url = URL(string: "message://") { UIApplication.shared.open(url) }
            }
            .padding(.horizontal, AppTheme.screenPadding)

            HStack(spacing: 4) {
                Text("Didn't receive the email?").font(AppTypography.callout).foregroundStyle(AppColors.grayText)
                Button("Resend") {}.font(.system(size: 14, weight: .bold)).foregroundStyle(AppColors.primaryPurple)
            }

            Button { dismiss() } label: {
                HStack(spacing: 4) { Image(systemName: "arrow.left"); Text("Back to Log In") }
                    .font(.system(size: 14, weight: .medium)).foregroundStyle(AppColors.darkText)
            }

            Spacer()
        }
        .background(.white)
        .navigationBarBackButtonHidden()
    }
}
