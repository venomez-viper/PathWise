import SwiftUI

struct ChipView: View {
    let title: String
    let isSelected: Bool
    var icon: String? = nil
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 6) {
                if isSelected {
                    Image(systemName: "checkmark")
                        .font(.system(size: 12, weight: .bold))
                } else if let icon {
                    Image(systemName: icon)
                        .font(.system(size: 12))
                }
                Text(title)
                    .font(.system(size: 14, weight: .medium))
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 10)
            .foregroundStyle(isSelected ? .white : AppColors.grayText)
            .background(isSelected ? AnyShapeStyle(AppColors.primaryPurple) : AnyShapeStyle(Color.clear))
            .overlay(Capsule().stroke(isSelected ? Color.clear : AppColors.lightGrayBorder, lineWidth: 1))
            .clipShape(Capsule())
        }
    }
}
