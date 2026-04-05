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
                Image(systemName: icon).font(.system(size: 20))
                Text(label).font(.system(size: 14, weight: .medium))
            }
            .foregroundStyle(AppColors.darkText)
            .frame(maxWidth: .infinity)
            .frame(height: 48)
            .background(RoundedRectangle(cornerRadius: 12).stroke(AppColors.lightGrayBorder, lineWidth: 1))
        }
    }
}
