# BookerPro App Process Flows Documentation

## Overview
BookerPro is a comprehensive booking platform that serves three distinct user types:
1. **Clients** - Book services with providers
2. **Providers** - Offer services and manage appointments  
3. **Shop Owners** - Manage multiple providers and shops

## 1. Client User Journey

### Onboarding Flow
```mermaid
flowchart TD
    Start([Client Opens App]) --> Auth{Authenticated?}
    Auth -->|No| Login[Login/Signup Screen]
    Auth -->|Yes| CheckOnboard{Onboarding Complete?}
    
    Login --> CreateAccount[Create Account]
    CreateAccount --> BasicInfo[Enter Name, Email, Phone]
    BasicInfo --> SetPassword[Set Password]
    SetPassword --> CheckOnboard
    
    CheckOnboard -->|No| Welcome[Welcome Screen]
    CheckOnboard -->|Yes| Home[Home Dashboard]
    
    Welcome --> Location[Request Location Permission]
    Location --> Notifications[Request Notification Permission]
    Notifications --> ServicePref[Select Service Preferences]
    ServicePref --> StylePref[Select Style Preferences]
    StylePref --> CompleteOnboard[Complete Onboarding]
    CompleteOnboard --> Home
```

### Daily Use Flow
```mermaid
flowchart TD
    Home[Home Dashboard] --> ViewOptions{User Action}
    
    ViewOptions --> Explore[Explore Providers]
    ViewOptions --> Bookings[View Bookings]
    ViewOptions --> Profile[View Profile]
    ViewOptions --> Saved[Saved Providers]
    
    Explore --> Search[Search/Filter Providers]
    Search --> SelectProvider[Select Provider]
    SelectProvider --> ViewServices[View Services & Prices]
    ViewServices --> BookService[Book Service]
    
    BookService --> SelectService[Select Service]
    SelectService --> SelectDate[Select Date]
    SelectDate --> SelectTime[Select Time]
    SelectTime --> ConfirmBooking[Confirm Booking]
    ConfirmBooking --> Payment[Complete Payment]
    Payment --> BookingConfirmed[Booking Confirmed]
    
    Bookings --> ViewUpcoming[View Upcoming]
    Bookings --> ViewPast[View Past]
    ViewUpcoming --> AppointmentDetails[Appointment Details]
    AppointmentDetails --> CancelReschedule{Action}
    CancelReschedule --> Cancel[Cancel Appointment]
    CancelReschedule --> Reschedule[Reschedule]
```

## 2. Provider User Journey

### Onboarding Flow
```mermaid
flowchart TD
    Start([Provider Opens App]) --> Auth{Authenticated?}
    Auth -->|No| Signup[Provider Signup]
    Auth -->|Yes| CheckOnboard{Onboarding Complete?}
    
    Signup --> ProviderType[Select Provider Type]
    ProviderType --> PersonalInfo[Enter Personal Info]
    PersonalInfo --> WorkSituation{Work Situation?}
    
    WorkSituation -->|Own Shop| OwnShopAddress[Enter Shop Address]
    WorkSituation -->|Work at Shop| SearchShop[Search for Shop]
    WorkSituation -->|Mobile| TravelRadius[Set Travel Radius]
    WorkSituation -->|Home Studio| HomeAddress[Enter Home Address]
    
    SearchShop --> SelectShop[Select Shop]
    SelectShop --> InviteCode{Has Invite Code?}
    InviteCode -->|Yes| JoinShop[Join Shop]
    InviteCode -->|No| RequestJoin[Request to Join]
    
    OwnShopAddress --> Services[Set Services & Prices]
    TravelRadius --> Services
    HomeAddress --> Services
    JoinShop --> ProfileSetup[Profile Setup]
    RequestJoin --> Services
    
    Services --> ProfileSetup
    ProfileSetup --> AddPhoto[Add Profile Photo]
    AddPhoto --> WriteBio[Write Bio]
    WriteBio --> SetAvailability[Set Weekly Availability]
    SetAvailability --> CreateAccount[Create Provider Account]
    CreateAccount --> Dashboard[Provider Dashboard]
    
    CheckOnboard -->|No| ProviderType
    CheckOnboard -->|Yes| Dashboard
```

### Daily Use Flow
```mermaid
flowchart TD
    Dashboard[Provider Dashboard] --> ViewMetrics{View Options}
    
    ViewMetrics --> TodayAppts[Today's Appointments]
    ViewMetrics --> Calendar[Calendar View]
    ViewMetrics --> Earnings[Earnings Dashboard]
    ViewMetrics --> Analytics[Analytics]
    ViewMetrics --> Settings[Settings]
    
    TodayAppts --> AppointmentList[View Appointment List]
    AppointmentList --> AppointmentAction{Action}
    AppointmentAction --> CheckIn[Check In Client]
    AppointmentAction --> Complete[Complete Service]
    AppointmentAction --> NoShow[Mark No-Show]
    
    Complete --> ProcessPayment[Process Payment]
    ProcessPayment --> TipCollection[Collect Tip]
    TipCollection --> UpdateEarnings[Update Earnings]
    
    Earnings --> ViewDaily[Daily Earnings]
    Earnings --> ViewWeekly[Weekly Earnings]
    Earnings --> ViewMonthly[Monthly Earnings]
    ViewMonthly --> PayoutSettings[Payout Settings]
    
    Analytics --> Revenue[Revenue Trends]
    Analytics --> ClientDemo[Client Demographics]
    Analytics --> ServicePerf[Service Performance]
    Analytics --> GoalTracking[Goal Tracking]
    
    Settings --> ProfileSettings[Profile Settings]
    Settings --> ServiceSettings[Service Settings]
    Settings --> AvailabilitySettings[Availability Settings]
    Settings --> TipSettings[Tip Settings]
```

## 3. Shop Owner User Journey

### Onboarding Flow
```mermaid
flowchart TD
    Start([Shop Owner Opens App]) --> Auth{Authenticated?}
    Auth -->|No| OwnerSignup[Shop Owner Signup]
    Auth -->|Yes| CheckOnboard{Onboarding Complete?}
    
    OwnerSignup --> ShopInfo[Enter Shop Information]
    ShopInfo --> ShopAddress[Shop Address Lookup]
    ShopAddress --> OwnerInfo[Enter Owner Information]
    OwnerInfo --> ShopType[Select Service Categories]
    ShopType --> MasterServices[Set Master Service List]
    MasterServices --> AddService{Add Service}
    AddService --> ServiceDetails[Name, Duration, Price]
    ServiceDetails --> MoreServices{Add More?}
    MoreServices -->|Yes| AddService
    MoreServices -->|No| SelectPlan[Select Subscription Plan]
    
    SelectPlan --> Pro[Professional: 10 Providers]
    Pro --> PaymentInfo[Enter Payment Information]
    
    PaymentInfo --> Policies[Set Shop Policies]
    Policies --> CancelPolicy[Cancellation Policy]
    CancelPolicy --> CompleteSetup[Complete Setup]
    CompleteSetup --> GenerateCode[Generate Provider Invite Code]
    GenerateCode --> OwnerDashboard[Shop Owner Dashboard]
    
    CheckOnboard -->|No| ShopInfo
    CheckOnboard -->|Yes| OwnerDashboard
```

### Daily Use Flow
```mermaid
flowchart TD
    Dashboard[Shop Owner Dashboard] --> ViewMode{View Mode}
    
    ViewMode --> Overview[All Shops Overview]
    ViewMode --> Individual[Individual Shop View]
    
    Overview --> Metrics[Consolidated Metrics]
    Metrics --> TotalRevenue[Total Revenue]
    Metrics --> TotalStylists[Total Stylists]
    Metrics --> TotalAppts[Total Appointments]
    
    Individual --> ShopMetrics[Shop-Specific Metrics]
    ShopMetrics --> ShopRevenue[Shop Revenue]
    ShopMetrics --> ShopTeam[Shop Team]
    ShopMetrics --> ShopCalendar[Shop Calendar]
    
    Dashboard --> TeamMgmt[Team Management]
    TeamMgmt --> InviteProvider[Invite Provider]
    InviteProvider --> GenerateInvite[Generate Invite Code/Link]
    TeamMgmt --> ManageTeam[Manage Team]
    ManageTeam --> ViewProviders[View All Providers]
    ViewProviders --> ProviderAction{Provider Action}
    ProviderAction --> EditPermissions[Edit Permissions]
    ProviderAction --> ViewPerformance[View Performance]
    ProviderAction --> RemoveProvider[Remove Provider]
    
    Dashboard --> BoothRent[Booth Rent System]
    BoothRent --> RentStatus[View Rent Status]
    RentStatus --> PendingRents[Pending Payments]
    RentStatus --> OverdueRents[Overdue Rents]
    PendingRents --> MarkPaid[Mark as Paid]
    OverdueRents --> SendReminder[Send Reminder]
    
    BoothRent --> AutoCalc[Automated Calculation]
    AutoCalc --> RevenueBase[Revenue-Based: 15-25%]
    AutoCalc --> FixedRate[Fixed Rate: $800-1200]
    
    Dashboard --> Analytics[Advanced Analytics]
    Analytics --> RevenueAnalysis[Revenue Analysis]
    Analytics --> TeamPerformance[Team Performance]
    Analytics --> ClientInsights[Client Insights]
    Analytics --> ExportReport[Export Reports]
    
    Dashboard --> ShopSettings[Shop Settings]
    ShopSettings --> EditInfo[Edit Shop Info]
    ShopSettings --> EditServices[Edit Service Menu]
    ShopSettings --> EditPolicies[Edit Policies]
    ShopSettings --> BillingSettings[Billing Settings]
```

## Key Features by User Type

### Client Features
- Browse and search providers
- Book appointments
- Manage bookings (view, cancel, reschedule)
- Save favorite providers
- View appointment history
- Make payments
- Leave reviews

### Provider Features
- Manage daily appointments
- Track earnings and tips
- View analytics and performance metrics
- Set availability
- Manage services and pricing (if independent)
- Process payments
- Goal tracking
- Client management

### Shop Owner Features
- Multi-shop management
- Team management and invitations
- Booth rent system with automation
- Consolidated analytics across shops
- Service menu control
- Subscription management
- Performance tracking
- Revenue optimization tools
- Automated payment reminders
- Advanced reporting

## Technical Implementation Notes

### Authentication & Authorization
- Role-based access control (client, provider, owner)
- Developer mode for testing different user types
- Persistent login state using AsyncStorage

### State Management
- Context providers for each user type's onboarding
- Shared providers for common functionality (auth, bookings, analytics)
- React Query for server state management
- Local state for UI components

### Navigation Structure
- Tab-based navigation for main app sections
- Stack navigation for onboarding flows
- Modal presentations for critical actions
- Deep linking support for provider profiles and bookings

### Data Flow
- Mock data for development/testing
- Prepared for backend integration
- Optimistic updates for better UX
- Offline support with data synchronization

## Testing Different User Flows

To test each user type in development mode:

1. **Enable Developer Mode**: Access through profile settings
2. **Test Accounts Available**:
   - Client: `client@test.com` / `password123`
   - Provider: `provider@test.com` / `password123`
   - Shop Owner: `owner@test.com` / `password123`
3. **Reset Onboarding**: Available in settings to re-test onboarding flows
4. **Mock Data**: Pre-populated for each user type to simulate real usage