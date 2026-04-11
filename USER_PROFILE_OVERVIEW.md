# Khoj User Profile System - Overview

## 1. USER PROFILE RELATED FILES

### Server-Side (PHP/Laravel)

#### Models
- **[server/app/Models/User.php](server/app/Models/User.php)** - Main User model with relationship to UserInfo
  - Contains basic user data: name, email, phone, address, pic_url, password, role
  - Has `info()` relationship method that returns `hasOne(UserInfo::class)`
  - JWT authentication methods for API access

- **[server/app/Models/UserInfo.php](server/app/Models/UserInfo.php)** - Extended user profile information
  - `user_id` - Foreign key to users
  - `bio` - User biography
  - Social media URLs: `fb_url`, `x_url`, `insta_url`, `linkedin_url`
  - **`items_lost_count`** - Count of items user reported as lost
  - **`items_found_count`** - Count of items user reported as found
  - `report_strikes` - Count of admin strikes against user's posts

#### Controllers
- **[server/app/Http/Controllers/ProfileController.php](server/app/Http/Controllers/ProfileController.php)**
  - `show()` - GET endpoint returning authenticated user's profile with info relationship
  - `update()` - POST endpoint to update user profile and user_info fields
  - `updatePassword()` - Change password endpoint

- **[server/app/Http/Controllers/UserController.php](server/app/Http/Controllers/UserController.php)**
  - `index()` - GET all users with their info (admin only)
  - Loads users with relationship: `User::with('info')->get()`

- **[server/app/Http/Controllers/ActivityController.php](server/app/Http/Controllers/ActivityController.php)**
  - `myActivity()` - Returns user's activity: lost items, found items, claims, etc.
  - Loads user info via: `->with(['user', 'user.info'])`

### Client-Side (React/TypeScript)

#### User Profile Components
- **[client/src/views/user/Profile.tsx](client/src/views/user/Profile.tsx)**
  - Displays user's own profile with editable fields
  - Fetches from `GET /api/profile`
  - Shows: `items_lost`, `items_found`, `strikes` stats
  - Allows editing: name, phone, address, bio, social media URLs
  - Uploads profile pictures to Cloudinary

- **[client/src/views/admin/AdminProfile.tsx](client/src/views/admin/AdminProfile.tsx)**
  - Admin-specific profile view (read-only contact info)
  - Different styling and limited editing

- **[client/src/views/admin/AllUsers.tsx](client/src/views/admin/AllUsers.tsx)**
  - List all users with their statistics
  - Fetches from `GET /api/users`
  - Displays `items_lost_count`, `items_found_count`, `report_strikes` from user.info

#### Activity/Item Components
- **[client/src/views/user/Items.tsx](client/src/views/user/Items.tsx)**
  - Browse lost/found items
  - Shows user info in item cards via `item.user.info`
  - Type interface:
    ```typescript
    interface UserInfo {
        bio?: string | null;
        fb_url?: string | null;
        x_url?: string | null;
        insta_url?: string | null;
        linkedin_url?: string | null;
    }
    ```

- **[client/src/views/user/MyActivity.tsx](client/src/views/user/MyActivity.tsx)**
  - User's activity dashboard
  - Shows lost items, found items, claims received, etc.
  - Displays user info in modal when clicking on item posters

---

## 2. API ENDPOINTS FOR USER INFORMATION

### Authentication Endpoints
```
POST /api/register - Register new user
  - Creates user entry
  - Creates empty user_info entry (via ApiAuthController)

POST /api/login - Login user
```

### Profile Endpoints (Authenticated - JWT)
```
GET /api/profile
  - Returns authenticated user with user info
  - Response: { user: { ...userFields, info: UserInfo } }
  - Used by: Profile.tsx, AdminProfile.tsx
  - Location: ProfileController::show()

POST /api/profile
  - Update user's profile and user_info
  - Updates: name, phone, address, pic_url, bio, linkedin_url, x_url
  - Location: ProfileController::update()

POST /api/profile/password
  - Change user password
  - Location: ProfileController::updatePassword()
```

### User Management Endpoints (Admin Only)
```
GET /api/users
  - Returns all users with their info
  - Response: { users: User[] } where User includes user.info
  - Checks: if user.role !== 'admin' → 403 Forbidden
  - Used by: AllUsers.tsx admin component
  - Location: UserController::index()
```

### Activity Endpoints (Authenticated)
```
GET /api/my-activity
  - Returns user's activity: lost items, found items, claims, resolved items
  - Loads: ->with(['user', 'user.info'])
  - Used by: MyActivity.tsx
  - Location: ActivityController::myActivity()
```

### Item Endpoints (Include User Info)
```
GET /api/items
  - List all valid items
  - Loads: ->with(['user', 'user.info'])
  - Returns user info for item posters

GET /api/items/search
  - Gemini AI search for items
  - Includes user info in results

POST /api/items
  - Create new lost/found item report
  - Location: ItemController::store()

POST /api/items/{id}/claim
  - Claim an item / Toggle claim
  - Location: ItemController::toggleClaim()
```

### Claim Endpoints
```
POST /api/claims/{claimId}/accept
  - Accept a claim for an item
  - Updates item.resolution_status = 'resolved'
  - Location: ClaimController::acceptClaim()

POST /api/claims/{claimId}/decline
  - Decline a claim
  - Location: ClaimController::declineClaim()
```

---

## 3. DATABASE QUERIES SELECTING FROM user_info

### Database Structure
```sql
CREATE TABLE user_info (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    bio TEXT,
    fb_url VARCHAR(255),
    x_url VARCHAR(255),
    insta_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    items_lost_count INT DEFAULT 0,
    items_found_count INT DEFAULT 0,
    report_strikes INT DEFAULT 0,
    CONSTRAINT fk_user_stats FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)
```

### Laravel Eloquent Queries

**Profile Controller - Fetch user with info:**
```php
// ProfileController::show()
$user = $request->user()->load('info');
return response()->json(['user' => $user]);
```

**User Controller - List all users with info:**
```php
// UserController::index()
$users = User::with('info')->get();
return response()->json(['users' => $users]);
```

**Activity Controller - Fetch items with user info:**
```php
// ActivityController::myActivity()
$lostItems = Item::where('user_id', $user->id)
    ->where('valid', 1)
    ->where('status', 'lost')
    ->with(['user', 'user.info'])
    ->get();

// Similar for foundItems, claimRequests, claimsReceived
```

**Item Controller - Fetch items with user info:**
```php
// ItemController::index()
$items = $query->with(['user', 'user.info'])->get();

// ItemController::adminActivePosts()
$items = Item::where('valid', 1)
    ->with(['user', 'user.info'])
    ->orderByDesc('created_at')
    ->get();
```

**Registration - Create empty user_info:**
```php
// ApiAuthController::register()
\App\Models\UserInfo::create([
    'user_id' => $user->id,
    'bio' => '',
    'fb_url' => '',
    'x_url' => '',
    'insta_url' => '',
    'linkedin_url' => '',
]);
```

---

## 4. items_lost_count AND items_found_count USAGE

### Where They Are Used

#### 1. **Profile Display** ([client/src/views/user/Profile.tsx](client/src/views/user/Profile.tsx#L82))
```typescript
// Line 82-83: Loading from API response
const loaded: ProfileData = {
    // ...
    items_lost: i.items_lost_count || 0,
    items_found: i.items_found_count || 0,
    strikes: i.report_strikes || 0,
};

// Line 524-527: Display in user's own profile
<div className="flex flex-col items-center p-5 bg-rose-500/15...">
    <FaBoxOpen className="mb-2 text-2xl opacity-70" />
    <span className="font-black text-3xl">{userData.items_lost}</span>
    <span className="text-[10px] font-bold uppercase tracking-widest">Lost</span>
</div>
<div className="flex flex-col items-center p-5 bg-emerald-500/15...">
    <FaSearch className="mb-2 text-2xl opacity-70" />
    <span className="font-black text-3xl">{userData.items_found}</span>
    <span className="text-[10px] font-bold uppercase tracking-widest">Found</span>
</div>
```

#### 2. **Admin User Management** ([client/src/views/admin/AllUsers.tsx](client/src/views/admin/AllUsers.tsx#L15))
```typescript
interface UserData {
    id: number;
    name: string;
    // ...
    info?: {
        items_lost_count: number;
        items_found_count: number;
        report_strikes: number;
    };
}
```

#### 3. **Fetching User Data**
- **API Response** ([ProfileController::show()](server/app/Http/Controllers/ProfileController.php#L17))
  - Returns user with user.info relationship
  - Info includes items_lost_count and items_found_count

- **Seed Data** ([database/migrations/seed_data.sql](database/migrations/seed_data.sql#L22))
  - Inserted with default values for test users

### Current Status
**⚠️ NOTE:** The counts `items_lost_count` and `items_found_count` are:
- ✅ **Defined** in database schema
- ✅ **Stored** in user_info table  
- ✅ **Displayed** in UI (Profile.tsx, AllUsers.tsx)
- ✅ **Fetched** from API with user info
- ❌ **NOT automatically incremented** when items are created or resolved

**Missing Logic:** There is currently no code that increments these counts when:
- User creates a "lost" item → should increment `items_lost_count`
- User creates a "found" item → should increment `items_found_count`
- Item claim is accepted/resolved → optionally update counts

The counts only exist as database fields initialized to 0 and displayed in the UI, but are not actively maintained.

---

## 5. KEY CODE SNIPPETS

### Fetching User Profile (Client)
```typescript
// Profile.tsx - Line 62-70
const token = localStorage.getItem('token');
const { data } = await axios.get('http://localhost:8000/api/profile', {
    headers: { Authorization: `Bearer ${token}` },
});
const u = data.user;
const i = u.info || {};
const loaded: ProfileData = {
    // ... map all fields including items_lost, items_found from i.items_lost_count, i.items_found_count
};
```

### Updating User Profile (Client)
```typescript
// Profile.tsx - Line 129-147
const form = new FormData();
Object.entries({
    name: editData.name, 
    phone: editData.phone, 
    address: editData.address,
    bio: editData.bio, 
    fb_url: editData.fb_url, 
    x_url: editData.x_url,
    insta_url: editData.insta_url, 
    linkedin_url: editData.linkedin_url,
}).forEach(([k, v]) => {
    // form append...
});
// POST to /api/profile
```

### Displaying User Info in Item Cards
```typescript
// Items.tsx - Line 639-655
{report.user && (
    <div className="bg-slate-800/70 rounded-2xl p-3 mb-4">
        <div className="flex items-center gap-3">
            <img
                src={report.user.pic_url || 'default'}
                alt={report.user.name}
                className="w-10 h-10 rounded-full"
            />
            <div>
                <p className="text-xs text-slate-400">Posted by</p>
                <p className="text-sm font-bold text-slate-100">{report.user.name}</p>
            </div>
        </div>
    </div>
)}
```

### Querying in Activity Controller
```php
// ActivityController.php - Line 10-24
$lostItems = Item::where('user_id', $user->id)
    ->where('valid', 1)
    ->where('status', 'lost')
    ->where('resolution_status', '!=', 'resolved')
    ->with(['user', 'user.info'])
    ->get();

$foundItems = Item::where('user_id', $user->id)
    ->where('valid', 1)
    ->where('status', 'found')
    ->where('resolution_status', '!=', 'resolved')
    ->with(['user', 'user.info'])
    ->get();
```

---

## 6. DATA FLOW SUMMARY

```
User Registration
    ↓
CREATE users + user_info (empty entry)
    ↓
API: GET /api/profile
    ↓
ProfileController: user.load('info')
    ↓
Response: User with info {items_lost_count: 0, items_found_count: 0, ...}
    ↓
Client: Profile.tsx
    ↓
Display: items_lost, items_found in stats boxes
    ↓
Admin: AllUsers.tsx
    ↓
Display: All users' info including items_lost_count, items_found_count
```

---

## Files Summary Table

| Type | Server Path | Client Path | Purpose |
|------|-------------|------------|---------|
| **Model** | `server/app/Models/User.php` | - | User entity with info() relationship |
| **Model** | `server/app/Models/UserInfo.php` | - | Extended user data with counts and socials |
| **Controller** | `server/app/Http/Controllers/ProfileController.php` | - | Get/update user profile |
| **Controller** | `server/app/Http/Controllers/UserController.php` | - | Admin: list all users |
| **Controller** | `server/app/Http/Controllers/ActivityController.php` | - | User activity queries |
| **Route** | `server/routes/api.php` | - | API endpoint definitions |
| **Component** | - | `client/src/views/user/Profile.tsx` | User's profile display/edit |
| **Component** | - | `client/src/views/admin/AllUsers.tsx` | Admin user management |
| **Component** | - | `client/src/views/user/Items.tsx` | Browse items with user info |
| **Component** | - | `client/src/views/user/MyActivity.tsx` | User activity dashboard |
| **Database** | `database/migrations/001_init_tables.sql` | - | user_info table schema |

