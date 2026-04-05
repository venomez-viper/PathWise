import SwiftUI

enum AppTab: String, CaseIterable, Identifiable {
    case home = "Home"
    case roadmap = "Roadmap"
    case tasks = "Tasks"
    case progress = "Progress"
    case settings = "Settings"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .home: return "house.fill"
        case .roadmap: return "point.topleft.down.to.point.bottomright.curvepath.fill"
        case .tasks: return "checklist"
        case .progress: return "chart.bar.fill"
        case .settings: return "gearshape.fill"
        }
    }

    var iconOutlined: String {
        switch self {
        case .home: return "house"
        case .roadmap: return "point.topleft.down.to.point.bottomright.curvepath"
        case .tasks: return "checklist"
        case .progress: return "chart.bar"
        case .settings: return "gearshape"
        }
    }
}

enum SecondaryDestination: String, CaseIterable, Identifiable {
    case streaks = "Streaks"
    case achievements = "Achievements"
    case certificates = "Certificates"
    case notifications = "Notifications"
    case search = "Search"
    case help = "Help & FAQ"

    var id: String { rawValue }

    var icon: String {
        switch self {
        case .streaks: return "flame.fill"
        case .achievements: return "trophy.fill"
        case .certificates: return "scroll.fill"
        case .notifications: return "bell.fill"
        case .search: return "magnifyingglass"
        case .help: return "questionmark.circle.fill"
        }
    }
}

struct MainTabView: View {
    @Environment(AuthManager.self) private var authManager
    @State private var selectedTab: AppTab = .home

    var body: some View {
        if UIDevice.current.userInterfaceIdiom == .pad {
            iPadSidebarLayout
        } else {
            iPhoneTabLayout
        }
    }

    private var iPhoneTabLayout: some View {
        TabView(selection: $selectedTab) {
            ForEach(AppTab.allCases) { tab in
                NavigationStack {
                    tabContent(for: tab)
                }
                .tabItem {
                    Label(tab.rawValue.uppercased(), systemImage: selectedTab == tab ? tab.icon : tab.iconOutlined)
                }
                .tag(tab)
            }
        }
        .tint(AppColors.primaryPurple)
    }

    @State private var selectedSidebar: String? = AppTab.home.rawValue

    private var iPadSidebarLayout: some View {
        NavigationSplitView {
            List(selection: $selectedSidebar) {
                Section("Main") {
                    ForEach(AppTab.allCases) { tab in
                        Label(tab.rawValue, systemImage: tab.icon).tag(tab.rawValue)
                    }
                }
                Section("More") {
                    ForEach(SecondaryDestination.allCases) { dest in
                        Label(dest.rawValue, systemImage: dest.icon).tag(dest.rawValue)
                    }
                }
            }
            .navigationTitle("PathWise")
            .tint(AppColors.primaryPurple)
        } detail: {
            if let selected = selectedSidebar {
                if let tab = AppTab(rawValue: selected) {
                    NavigationStack { tabContent(for: tab) }
                } else if let dest = SecondaryDestination(rawValue: selected) {
                    NavigationStack { secondaryContent(for: dest) }
                }
            }
        }
    }

    @ViewBuilder
    private func tabContent(for tab: AppTab) -> some View {
        switch tab {
        case .home: PlaceholderView(name: "Dashboard")
        case .roadmap: PlaceholderView(name: "Roadmap")
        case .tasks: PlaceholderView(name: "Tasks")
        case .progress: PlaceholderView(name: "Progress")
        case .settings: PlaceholderView(name: "Settings")
        }
    }

    @ViewBuilder
    private func secondaryContent(for dest: SecondaryDestination) -> some View {
        switch dest {
        case .streaks: PlaceholderView(name: "Streaks")
        case .achievements: PlaceholderView(name: "Achievements")
        case .certificates: PlaceholderView(name: "Certificates")
        case .notifications: PlaceholderView(name: "Notifications")
        case .search: PlaceholderView(name: "Search")
        case .help: PlaceholderView(name: "Help & FAQ")
        }
    }
}

// Temporary placeholder until real views are built
private struct PlaceholderView: View {
    let name: String
    var body: some View {
        VStack {
            Text(name)
                .font(AppTypography.title1)
                .foregroundStyle(AppColors.primaryPurple)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(AppColors.offWhiteBg)
        .navigationTitle(name)
    }
}
