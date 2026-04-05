import SwiftUI

enum BadgeStyle {
    case highPriority, mediumPriority, lowPriority
    case verified, bestMatch, current
    case custom(Color, Color)

    var backgroundColor: Color {
        switch self {
        case .highPriority: return AppColors.highPriorityRed.opacity(0.15)
        case .mediumPriority: return AppColors.warningAmber.opacity(0.15)
        case .lowPriority: return AppColors.lowPriorityTeal.opacity(0.2)
        case .verified, .bestMatch: return AppColors.successGreen.opacity(0.15)
        case .current: return AppColors.tealAccent.opacity(0.15)
        case .custom(let bg, _): return bg
        }
    }

    var textColor: Color {
        switch self {
        case .highPriority: return AppColors.highPriorityRed
        case .mediumPriority: return AppColors.warningAmber
        case .lowPriority: return AppColors.tealAccent
        case .verified, .bestMatch: return AppColors.successGreen
        case .current: return AppColors.tealAccent
        case .custom(_, let fg): return fg
        }
    }
}

struct BadgeView: View {
    let text: String
    let style: BadgeStyle

    var body: some View {
        Text(text)
            .font(.system(size: 10, weight: .bold))
            .tracking(0.5)
            .textCase(.uppercase)
            .foregroundStyle(style.textColor)
            .padding(.horizontal, 10)
            .padding(.vertical, 4)
            .background(style.backgroundColor, in: Capsule())
    }
}
