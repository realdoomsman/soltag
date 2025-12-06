# @alias - Solana Wallet Alias Registry

Human-readable @handles for Solana wallets. The ENS of Solana, but simpler and meme-friendly.

## Features

- **Register @handles** - Claim your unique username (e.g., @mango, @king, @degen)
- **Send to aliases** - No more copying base58 addresses
- **Premium pricing** - Short names (3-4 chars) cost more
- **Transferable** - Buy/sell handles like digital real estate
- **Verification badges** - Link Twitter, Discord, GitHub
- **Sub-aliases** - @brand.support, @brand.treasury (coming soon)

## Pricing

| Length | Price/Year |
|--------|------------|
| 3 chars | 5 SOL |
| 4 chars | 2 SOL |
| 5 chars | 0.5 SOL |
| 6+ chars | 0.1 SOL |

## Project Structure

```
wallet-alias-registry/
├── programs/alias-registry/   # Solana program (Anchor)
├── api/                       # REST API for resolving aliases
├── web/                       # React frontend
└── tests/                     # Integration tests
```

## Quick Start

### 1. Build the Program

```bash
anchor build
```

### 2. Run Tests

```bash
anchor test
```

### 3. Deploy to Devnet

```bash
anchor deploy --provider.cluster devnet
```

### 4. Start the API

```bash
cd api
npm install
cp .env.example .env
npm run dev
```

### 5. Start the Frontend

```bash
cd web
npm install
npm run dev
```

## API Endpoints

### Resolve Alias
```
GET /resolve/:alias
```
Returns wallet address for an alias.

### Check Availability
```
GET /check/:alias
```
Check if an alias is available.

### Calculate Fee
```
GET /fee/:alias?years=1
```
Get registration cost.

## Integration

```typescript
// Resolve an alias
const response = await fetch('https://api.alias.solana/resolve/mango');
const { address } = await response.json();
// address = "BKu...7fj"

// Send SOL to alias
const recipient = await resolveAlias('@mango');
await sendSol(recipient, 1.0);
```

## Roadmap

- [ ] Mainnet launch
- [ ] Verification system (Twitter, Discord)
- [ ] Sub-aliases for businesses
- [ ] Marketplace for trading handles
- [ ] Wallet integrations (Phantom, Backpack)
- [ ] SDK for developers

## License

MIT
