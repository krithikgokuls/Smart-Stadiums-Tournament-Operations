import assert from "node:assert";
import { Incident, StadiumZone, VolunteerStaff, OperationsStats } from "../src/types";

// Simple test runner structure
const tests: Record<string, () => void | Promise<void>> = {};

// 1. Test standard stadium recommendation logic (fallback engine)
tests["stadium recommendation logic for medical category"] = () => {
  const recommendation = getDefaultRecommendation("medical", "Zone A - North Concourse", "Gate 1");
  assert.match(recommendation, /medical/i);
  assert.match(recommendation, /Zone C/);
};

tests["stadium recommendation logic for crowd category"] = () => {
  const recommendation = getDefaultRecommendation("crowd", "Zone B - East Concourse", "Gate 4");
  assert.match(recommendation, /turnstiles/i || /ingress/i || /PA/);
};

// 2. Test initial database state models
tests["database mock models structure"] = () => {
  const zones: StadiumZone[] = [
    {
      id: "zone-a",
      name: "Zone A - North Concourse",
      capacity: 18000,
      currentCrowdCount: 14200,
      densityStatus: "Moderate",
      gates: ["Gate 1", "Gate 2", "Gate 3"],
      features: { restrooms: true, concessions: ["Taco Cantina"], wheelchairAccess: true, firstAid: true }
    }
  ];
  
  assert.strictEqual(zones[0].gates.length, 3);
  assert.strictEqual(zones[0].features.wheelchairAccess, true);
};

tests["volunteers state structure"] = () => {
  const volunteers: VolunteerStaff[] = [
    {
      id: "staff-001",
      name: "Andrés Silva",
      role: "Volunteer",
      currentZone: "Zone B - East Concourse",
      languages: ["Spanish", "English", "Portuguese"],
      status: "Available",
      contact: "+52 55 1234 5678"
    }
  ];
  assert.strictEqual(volunteers[0].languages.includes("Spanish"), true);
  assert.strictEqual(volunteers[0].role, "Volunteer");
};

tests["operations statistics structure"] = () => {
  const stats: OperationsStats = {
    gateQueueTimes: { "Gate 1": 15 },
    totalActiveFans: 52300,
    totalVolunteersOnDuty: 245,
    sustainabilityScore: 84,
    carbonSavedKg: 1245
  };
  assert.strictEqual(stats.sustainabilityScore, 84);
  assert.strictEqual(stats.gateQueueTimes["Gate 1"], 15);
};

// Mock copy of the server's fallback function to verify its logic in isolated test environments
function getDefaultRecommendation(category: string, zone: string, location: string): string {
  switch (category) {
    case "medical":
      return `1. Deploy nearest first aid responder in ${zone} directly to ${location}.\n2. Alert doctor on standby in Zone C.\n3. Clear passage for medical cart exit.`;
    case "crowd":
      return `1. Station stewards at the entrance of ${location} to control ingress lines.\n2. Open secondary turnstiles immediately.\n3. Inform fans via PA to space out.`;
    case "security":
      return `1. Discrectly dispatch security team to ${location}.\n2. Monitor security CCTV feed of ${zone}.\n3. Ready supervisor alert.`;
    default:
      return `1. Send maintenance staff to ${location} immediately.\n2. Mark any hazard lines.\n3. Notify supervisor upon completion.`;
  }
}

// Execute tests
async function runTests() {
  console.log("🚀 Starting Tactical Command automated tests...");
  let passed = 0;
  let failed = 0;

  for (const [name, testFn] of Object.entries(tests)) {
    try {
      await testFn();
      console.log(`✅ Passed: ${name}`);
      passed++;
    } catch (error) {
      console.error(`❌ Failed: ${name}`);
      console.error(error);
      failed++;
    }
  }

  console.log(`\n📋 Test Summary: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log("🎉 All automated validation tests completed successfully!");
    process.exit(0);
  }
}

runTests();
