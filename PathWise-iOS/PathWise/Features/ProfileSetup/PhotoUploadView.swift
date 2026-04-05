import SwiftUI

struct PhotoUploadView: View {
    let onComplete: () -> Void
    let onSkip: () -> Void

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            HStack(spacing: 4) {
                Image(systemName: "book.fill").foregroundStyle(AppColors.primaryPurple)
                Text("PathWise").font(.system(size: 18, weight: .bold)).foregroundStyle(AppColors.primaryPurple)
            }
            Text("PROFILE SETUP").capsStyle(size: 10)

            ZStack(alignment: .bottomTrailing) {
                Circle().fill(AppColors.inputBg).frame(width: 140, height: 140)
                    .overlay { Image(systemName: "person.fill").font(.system(size: 56)).foregroundStyle(AppColors.grayText) }
                Circle().fill(AppColors.primaryPurple).frame(width: 36, height: 36)
                    .overlay { Image(systemName: "camera.fill").font(.system(size: 16)).foregroundStyle(.white) }
                    .offset(x: -4, y: -4)
            }

            Text("Add a profile photo").font(AppTypography.title3).foregroundStyle(AppColors.darkText)
            Text("Personalize your journey. A photo helps mentors and peers recognize you in the workspace.")
                .font(AppTypography.callout).foregroundStyle(AppColors.grayText).multilineTextAlignment(.center).padding(.horizontal, 32)

            VStack(spacing: 12) {
                PillButton(title: "Take Photo", icon: "camera") { onComplete() }
                OutlinedButton(title: "Choose from Library", icon: "photo") { onComplete() }
            }
            .padding(.horizontal, AppTheme.screenPadding)

            Button("Skip for now") { onSkip() }
                .font(.system(size: 14, weight: .medium)).foregroundStyle(AppColors.darkText)

            Spacer()
        }
        .background(
            LinearGradient(colors: [.white, AppColors.lavenderBg.opacity(0.5)], startPoint: .top, endPoint: .bottom).ignoresSafeArea()
        )
    }
}
