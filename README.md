# Team LEAF 🍃

**A community safety network built on transparency and the public's right to know.**

---

## 🛡️ Core Philosophy: Prevention > Cure

Every year, thousands of accidents occur due to unreported infrastructure hazards—potholes, live hanging wires, damaged bridges, and severe waterlogging. We believe that public safety shouldn't rely solely on delayed municipal surveys. **Team LEAF** empowers citizens to report immediate dangers, creating a real-time, transparent safety network for the community.

## 🗺️ The Vision: An API Data Layer

**What We Are NOT:** 
We are not trying to build a billion-dollar mega-app or a standalone navigation system to compete with tech giants like Google Maps or Waze. 

**What We ARE:** 
We are a **transparent data pipeline**. Team LEAF is designed to act as a highly verified, public-sourced **hazard overlay (API data layer)**. Our ultimate goal is for existing mapping giants to plug into our data stream, integrating our hyper-local, community-verified hazard alerts directly into the tools people already use every day.

## 🔐 Tech & Security: The AI Verification Gate

To ensure our data pipeline remains pristine and trustworthy, we have implemented a strict **AI Verification Gate** to completely eliminate false, spam, or misleading reports.

- **Multimodal AI Analysis:** Every reported hazard is instantly analyzed by advanced vision AI to verify its severity and category.
- **Strict Camera-Only Policy:** Reports require *live* camera captures. Uploading from the gallery is strictly disabled to prevent recycled or falsified images.
- **Unalterable GPS:** Cryptographically secure, device-level GPS coordinates are embedded at the moment of capture.
- **Community Moderation:** A decentralized civic karma system allows trusted users to quickly flag anomalies for manual review.

---

## 🚀 Getting Started (Testing the Repo)

Want to run Team LEAF locally? Follow these standard Next.js setup instructions:

1. **Clone & Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env.local` file in the root directory. If you are testing our AI Verification Gate, you will need to add your API keys here:
   ```env
   # Add your API keys here
   # NEXT_PUBLIC_AI_API_KEY=your_key_here
   ```

3. **Run the Development Server**
   ```bash
   npm run dev
   ```

4. **View the App**
   Open [http://localhost:3000](http://localhost:3000) in your browser to interact with the prototype.

---

*Built with Next.js, Tailwind CSS, Zustand, and React Leaflet.*
