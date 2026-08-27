import mongoose from 'mongoose';
import env from '../src/config/env.js';
import User from '../src/models/User.js';
import Workflow from '../src/models/Workflow.js';
import Execution from '../src/models/Execution.js';
import ExecutionLog from '../src/models/ExecutionLog.js';
import AgentMemory from '../src/models/AgentMemory.js';
import Integration from '../src/models/Integration.js';
import Notification from '../src/models/Notification.js';

async function cleanMockData() {
  console.log('================================================================');
  console.log('🧹 AGENTFLOW_AI DATABASE CLEANUP & ISOLATION SCRIPT');
  console.log('================================================================\n');

  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('📦 Connected to database.');

    // 1. Find mock/test users created by automated test runners
    const testUsers = await User.find({
      $or: [
        { email: { $regex: /operator_phase/i } },
        { email: { $regex: /test_user/i } },
        { email: { $regex: /mock/i } },
      ],
    });

    const testUserIds = testUsers.map((u) => u._id);
    console.log(`🔍 Identified ${testUserIds.length} automated test accounts.`);

    if (testUserIds.length > 0) {
      const [delWf, delExec, delLogs, delMem, delInt, delNotif, delUsers] = await Promise.all([
        Workflow.deleteMany({ owner: { $in: testUserIds } }),
        Execution.deleteMany({ owner: { $in: testUserIds } }),
        ExecutionLog.deleteMany({
          executionId: {
            $in: (await Execution.find({ owner: { $in: testUserIds } })).map((e) => e._id),
          },
        }),
        AgentMemory.deleteMany({
          executionId: {
            $in: (await Execution.find({ owner: { $in: testUserIds } })).map((e) => e._id),
          },
        }),
        Integration.deleteMany({ owner: { $in: testUserIds } }),
        Notification.deleteMany({ owner: { $in: testUserIds } }),
        User.deleteMany({ _id: { $in: testUserIds } }),
      ]);

      console.log(`  ✅ Removed ${delUsers.deletedCount} automated test users`);
      console.log(`  ✅ Removed ${delWf.deletedCount} associated workflows`);
      console.log(`  ✅ Removed ${delExec.deletedCount} associated execution records`);
      console.log(`  ✅ Removed ${delInt.deletedCount} test integrations`);
      console.log(`  ✅ Removed ${delNotif.deletedCount} test notifications`);
    }

    // 2. Remove any orphaned workflows or executions without valid owners
    const validUserIds = (await User.find({}, '_id')).map((u) => u._id);

    const [orphanedWf, orphanedExec] = await Promise.all([
      Workflow.deleteMany({ owner: { $nin: validUserIds } }),
      Execution.deleteMany({ owner: { $nin: validUserIds } }),
    ]);

    if (orphanedWf.deletedCount > 0) {
      console.log(`  ✅ Cleaned ${orphanedWf.deletedCount} orphaned workflows without valid users`);
    }
    if (orphanedExec.deletedCount > 0) {
      console.log(`  ✅ Cleaned ${orphanedExec.deletedCount} orphaned executions without valid users`);
    }

    const remainingUsers = await User.countDocuments();
    const remainingWorkflows = await Workflow.countDocuments();
    const remainingExecutions = await Execution.countDocuments();

    console.log('\n📊 Database Status After Cleanup:');
    console.log(`  • Real User Accounts: ${remainingUsers}`);
    console.log(`  • Active Workflows: ${remainingWorkflows}`);
    console.log(`  • Execution Records: ${remainingExecutions}`);

    console.log('\n✨ Database is now 100% clean and isolated for new registrations!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

cleanMockData();
