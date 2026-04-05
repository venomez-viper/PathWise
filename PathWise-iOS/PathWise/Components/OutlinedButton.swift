import SwiftUI

struct OutlinedButton: View {
    let title: String
    var icon: String? = nil
    var color: Color = AppColors.primaryPurple
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if let icon { Image(systemName: icon) }
                Text(title)
            }
            .font(AppTypography.button)
            .foregroundStyle(color)
            .frame(maxWidth: .infinity)
            .frame(height: 48)
            .background(Capsule().stroke(color, lineWidth: 1.5))
        }
    }
}
