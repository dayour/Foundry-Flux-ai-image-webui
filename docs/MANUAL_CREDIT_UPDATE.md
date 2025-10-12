# Manual Credit Update Guide

This guide shows how to manually update user credits in the database using Prisma Studio with Playwright browser automation.

## Prerequisites

- Prisma Studio running (`npx prisma studio`)
- darbot-browse MCP tools available
- User account already exists in database

## Steps Using Playwright Automation

### 1. Start Prisma Studio

```powershell
npx prisma studio
```

Prisma Studio will open at `http://localhost:5555`

### 2. Navigate to Prisma Studio

```javascript
// Navigate to Prisma Studio
await browser.navigate('http://localhost:5555')
await browser.wait_for(3) // Wait for UI to load
```

### 3. Open User Model

```javascript
// Click on User model (shows count of records)
await browser.click('User model list item')
```

### 4. Select Credits Cell

```javascript
// Click on the credits cell for the target user
await browser.click('Credits cell')
```

### 5. Edit Credits Value

```javascript
// Double-click to enter edit mode
await browser.click('Credits value', { doubleClick: true })

// Type new credit amount (e.g., 1000000 for 1 million)
// Note: If there's an existing value, it will append
// Clear first with Ctrl+A then type new value
```

### 6. Save Changes

After editing, click the **Save** button in Prisma Studio UI to commit changes to the database.

## Example: Setting 2 Million Credits

Starting value: `2`
Typed: `1000000`
Result: `2000000` (appended, giving 2 million total)

## Alternative: Direct SQL Update

If you prefer a command-line approach:

```bash
npx prisma studio
```

Then manually update via the UI, or use Prisma Client:

```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

await prisma.user.update({
  where: { email: 'darbot@timelarp.com' },
  data: { credits: 1000000 }
})
```

## Tips

- **Unlimited Account System**: For development accounts like `darbot@timelarp.com`, consider adding to `lib/unlimitedAccounts.ts` instead of manually managing credits
- **Credit Deduction Bypass**: Unlimited accounts don't consume credits regardless of database value
- **UI Display**: Credits shown in UI reflect database value, but unlimited accounts won't be charged

## Related Files

- `lib/unlimitedAccounts.ts` - Centralized unlimited account whitelist
- `prisma/schema.prisma` - User model with credits field
- `app/api/predictions/route.ts` - Credit deduction logic with unlimited bypass
