import SwiftUI

enum AppTypography {
    static let largeTitle = Font.system(size: 32, weight: .bold)
    static let title1 = Font.system(size: 28, weight: .bold)
    static let title2 = Font.system(size: 24, weight: .semibold)
    static let title3 = Font.system(size: 20, weight: .semibold)
    static let headline = Font.system(size: 17, weight: .semibold)
    static let body = Font.system(size: 16, weight: .regular)
    static let callout = Font.system(size: 14, weight: .regular)
    static let caption1 = Font.system(size: 12, weight: .semibold)
    static let caption2 = Font.system(size: 10, weight: .regular)
    static let button = Font.system(size: 17, weight: .semibold)

    static func capsLabel(_ size: CGFloat = 10) -> Font {
        .system(size: size, weight: .semibold)
    }
}

extension View {
    func capsStyle(size: CGFloat = 10, color: Color = AppColors.grayText) -> some View {
        self.font(.system(size: size, weight: .semibold))
            .tracking(1.5)
            .foregroundStyle(color)
            .textCase(.uppercase)
    }
}
