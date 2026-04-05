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
                    ProgressView().tint(.white)
                } else {
                    if let icon { Image(systemName: icon) }
                    Text(title)
                }
            }
            .font(AppTypography.button)
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .frame(height: AppTheme.ctaHeight)
            .background(gradient ?? AppColors.purpleGradient, in: Capsule())
            .shadow(color: AppTheme.ctaShadowColor, radius: 6, x: 0, y: 4)
        }
        .disabled(isLoading || disabled)
        .opacity(disabled ? 0.5 : 1.0)
    }
}
