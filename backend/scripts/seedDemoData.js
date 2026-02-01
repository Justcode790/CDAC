/**
 * SUVIDHA 2026 - Comprehensive Demo Data Seeding System
 * 
 * This script creates realistic demo data for the government system:
 * - Government departments and sub-departments
 * - Officers with proper assignments and credentials
 * - Citizens with unique phone numbers
 * - Complaints with mixed statuses across departments
 * 
 * Idempotent operation - safe to run multiple times without duplicates.
 */

const mongoose = require('mongoose');
const { config } = require('dotenv');

// Load environment variables
config();

// Import models
const User = require('../models/User.js');
const Department = require('../models/Department.js');
const SubDepartment = require('../models/SubDepartment.js');
const Complaint = require('../models/Complaint.js');
const { createAuditLog } = require('../utils/auditLogger.js');

// Demo data configuration
const DEMO_DATA = {
  departments: [
    {
      name: 'Electricity Department',
      code: 'ELEC',
      description: 'Power supply, distribution, and electrical infrastructure management'
    },
    {
      name: 'Water Department', 
      code: 'WATER',
      description: 'Water supply, treatment, and distribution services'
    },
    {
      name: 'Gas Department',
      code: 'GAS', 
      description: 'Gas supply, pipeline maintenance, and safety services'
    },
    {
      name: 'Municipal Department',
      code: 'MUN',
      description: 'Municipal services, governance, and civic administration'
    }
  ],

  subDepartments: {
    'ELEC': [
      { name: 'Billing Section', code: 'BILL', description: 'Electricity billing and payment processing' },
      { name: 'Metering Section', code: 'METER', description: 'Meter installation and maintenance' },
      { name: 'Outage Management', code: 'OUTAGE', description: 'Power outage response and restoration' }
    ],
    'WATER': [
      { name: 'Supply Management', code: 'SUPPLY', description: 'Water supply and distribution' },
      { name: 'Leakage Control', code: 'LEAK', description: 'Pipeline maintenance and leak repairs' },
      { name: 'Quality Control', code: 'QUALITY', description: 'Water quality testing and monitoring' }
    ],
    'GAS': [
      { name: 'Pipeline Maintenance', code: 'PIPE', description: 'Gas pipeline installation and maintenance' },
      { name: 'Safety Inspection', code: 'SAFETY', description: 'Gas safety inspections and compliance' }
    ],
    'MUN': [
      { name: 'Sanitation Services', code: 'SANIT', description: 'Waste collection and sanitation' },
      { name: 'Waste Management', code: 'WASTE', description: 'Waste processing and disposal' },
      { name: 'Public Works', code: 'WORKS', description: 'Road maintenance and public infrastructure' }
    ]
  },

  citizens: [
    { name: 'Rajesh Kumar', mobileNumber: '9876543210', email: 'rajesh.kumar@email.com', address: '123 MG Road, Delhi' },
    { name: 'Priya Sharma', mobileNumber: '9876543211', email: 'priya.sharma@email.com', address: '456 Park Street, Mumbai' },
    { name: 'Amit Singh', mobileNumber: '9876543212', email: 'amit.singh@email.com', address: '789 Gandhi Nagar, Bangalore' },
    { name: 'Sunita Patel', mobileNumber: '9876543213', email: 'sunita.patel@email.com', address: '321 Nehru Place, Chennai' },
    { name: 'Vikram Gupta', mobileNumber: '9876543214', email: 'vikram.gupta@email.com', address: '654 Sector 15, Noida' }
  ],

  complaintTemplates: [
    // Electricity Department
    { title: 'Power Outage in Sector 12', description: 'Frequent power cuts affecting residential area', category: 'POWER_OUTAGE', priority: 'HIGH' },
    { title: 'Street Light Not Working', description: 'Street light pole #45 has been non-functional for 3 days', category: 'STREET_LIGHTING', priority: 'MEDIUM' },
    { title: 'High Electricity Bill', description: 'Unusually high electricity bill this month, requesting review', category: 'BILLING_ISSUE', priority: 'LOW' },
    
    // Water Department  
    { title: 'Water Supply Disruption', description: 'No water supply for past 2 days in residential complex', category: 'WATER_SUPPLY', priority: 'HIGH' },
    { title: 'Water Pipeline Leakage', description: 'Major water leakage on Main Road causing waterlogging', category: 'PIPELINE_ISSUE', priority: 'HIGH' },
    { title: 'Poor Water Quality', description: 'Water supplied has unusual taste and color', category: 'WATER_QUALITY', priority: 'MEDIUM' },
    
    // Gas Department
    { title: 'Gas Leakage Suspected', description: 'Strong gas smell detected near residential building', category: 'GAS_LEAKAGE', priority: 'CRITICAL' },
    { title: 'Gas Connection Request', description: 'Request for new gas connection for residential use', category: 'NEW_CONNECTION', priority: 'LOW' },
    
    // Municipal Department
    { title: 'Garbage Collection Missed', description: 'Garbage not collected for 3 days, causing hygiene issues', category: 'WASTE_MANAGEMENT', priority: 'MEDIUM' },
    { title: 'Road Pothole Repair', description: 'Large potholes on main road causing traffic issues', category: 'ROAD_MAINTENANCE', priority: 'MEDIUM' },
    { title: 'Stray Dog Menace', description: 'Increasing stray dog population causing safety concerns', category: 'PUBLIC_SAFETY', priority: 'MEDIUM' }
  ]
};

/**
 * Connect to MongoDB database
 */
const connectDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * Find or create Super Admin for seeding operations
 */
const getSuperAdmin = async () => {
  try {
    let superAdmin = await User.findOne({ role: 'SUPER_ADMIN' });
    
    if (!superAdmin) {
      console.log('⚠️  No Super Admin found. Creating demo Super Admin for seeding...');
      superAdmin = new User({
        role: 'SUPER_ADMIN',
        adminEmail: 'admin@suvidha.gov.in',
        adminName: 'Demo Super Administrator',
        password: '123456', // Will be hashed
        isActive: true
      });
      await superAdmin.save();
      console.log('✅ Demo Super Admin created for seeding');
    }
    
    return superAdmin;
  } catch (error) {
    console.error('❌ Error getting Super Admin:', error.message);
    throw error;
  }
};

/**
 * Seed government departments
 */
const seedDepartments = async (superAdmin) => {
  console.log('🏛️  Seeding departments...');
  const createdDepartments = {};
  
  for (const deptData of DEMO_DATA.departments) {
    try {
      // Check if department already exists
      let department = await Department.findOne({ code: deptData.code });
      
      if (!department) {
        department = new Department({
          ...deptData,
          createdBy: superAdmin._id,
          isActive: true
        });
        await department.save();
        console.log(`   ✅ Created department: ${deptData.name} (${deptData.code})`);
      } else {
        console.log(`   ℹ️  Department already exists: ${deptData.name} (${deptData.code})`);
      }
      
      createdDepartments[deptData.code] = department;
    } catch (error) {
      console.error(`   ❌ Error creating department ${deptData.name}:`, error.message);
    }
  }
  
  return createdDepartments;
};

/**
 * Seed sub-departments
 */
const seedSubDepartments = async (superAdmin, departments) => {
  console.log('🏢 Seeding sub-departments...');
  const createdSubDepartments = {};
  
  for (const [deptCode, subDepts] of Object.entries(DEMO_DATA.subDepartments)) {
    const department = departments[deptCode];
    if (!department) continue;
    
    createdSubDepartments[deptCode] = [];
    
    for (const subDeptData of subDepts) {
      try {
        // Check if sub-department already exists
        let subDepartment = await SubDepartment.findOne({ 
          code: subDeptData.code, 
          department: department._id 
        });
        
        if (!subDepartment) {
          subDepartment = new SubDepartment({
            ...subDeptData,
            department: department._id,
            createdBy: superAdmin._id,
            isActive: true
          });
          await subDepartment.save();
          console.log(`   ✅ Created sub-department: ${subDeptData.name} (${deptCode}-${subDeptData.code})`);
        } else {
          console.log(`   ℹ️  Sub-department already exists: ${subDeptData.name} (${deptCode}-${subDeptData.code})`);
        }
        
        createdSubDepartments[deptCode].push(subDepartment);
      } catch (error) {
        console.error(`   ❌ Error creating sub-department ${subDeptData.name}:`, error.message);
      }
    }
  }
  
  return createdSubDepartments;
};

/**
 * Generate officer credentials
 */
const generateOfficerCredentials = (department, subDepartment, index) => {
  const year = new Date().getFullYear();
  const officerId = `${department.code}_${subDepartment.code}_${year}_${(index + 1).toString().padStart(4, '0')}`;
  const password = '123456'; // Simple password for all officers
  
  return { officerId, password };
};

/**
 * Seed officers (at least one per sub-department)
 */
const seedOfficers = async (superAdmin, departments, subDepartments) => {
  console.log('👮 Seeding officers...');
  const createdOfficers = [];
  const officerCredentials = [];
  
  const officerNames = [
    'Rajesh Kumar Singh', 'Priya Sharma Gupta', 'Amit Kumar Patel', 'Sunita Devi Sharma',
    'Vikram Singh Rajput', 'Neha Kumari Jain', 'Suresh Kumar Yadav', 'Kavita Sharma Singh',
    'Manoj Kumar Gupta', 'Pooja Devi Patel', 'Ravi Kumar Sharma', 'Anjali Singh Yadav'
  ];
  
  let officerIndex = 0;
  
  for (const [deptCode, subDeptList] of Object.entries(subDepartments)) {
    const department = departments[deptCode];
    
    for (const subDepartment of subDeptList) {
      try {
        // Check if officer already exists for this sub-department
        const existingOfficer = await User.findOne({
          role: 'OFFICER',
          assignedSubDepartment: subDepartment._id
        });
        
        if (!existingOfficer) {
          const officerName = officerNames[officerIndex % officerNames.length];
          const { officerId, password } = generateOfficerCredentials(department, subDepartment, officerIndex);
          
          const officer = new User({
            role: 'OFFICER',
            officerId,
            password, // Will be hashed by pre-save middleware
            officerName,
            assignedDepartment: department._id,
            assignedSubDepartment: subDepartment._id,
            email: `${officerId.toLowerCase()}@suvidha.gov.in`,
            isActive: true,
            isTemporaryPassword: true,
            passwordChangeRequired: true
          });
          
          await officer.save();
          createdOfficers.push(officer);
          officerCredentials.push({
            officerId,
            password,
            officerName,
            department: department.name,
            subDepartment: subDepartment.name
          });
          
          console.log(`   ✅ Created officer: ${officerName} (${officerId}) - ${department.name}/${subDepartment.name}`);
        } else {
          console.log(`   ℹ️  Officer already exists for: ${department.name}/${subDepartment.name}`);
        }
        
        officerIndex++;
      } catch (error) {
        console.error(`   ❌ Error creating officer for ${department.name}/${subDepartment.name}:`, error.message);
      }
    }
  }
  
  return { createdOfficers, officerCredentials };
};

/**
 * Seed citizens
 */
const seedCitizens = async () => {
  console.log('👥 Seeding citizens...');
  const createdCitizens = [];
  
  for (const citizenData of DEMO_DATA.citizens) {
    try {
      // Check if citizen already exists
      let citizen = await User.findOne({ 
        mobileNumber: citizenData.mobileNumber,
        role: 'PUBLIC'
      });
      
      if (!citizen) {
        citizen = new User({
          role: 'PUBLIC',
          ...citizenData,
          isMobileVerified: true // For demo purposes
        });
        await citizen.save();
        createdCitizens.push(citizen);
        console.log(`   ✅ Created citizen: ${citizenData.name} (${citizenData.mobileNumber})`);
      } else {
        createdCitizens.push(citizen);
        console.log(`   ℹ️  Citizen already exists: ${citizenData.name} (${citizenData.mobileNumber})`);
      }
    } catch (error) {
      console.error(`   ❌ Error creating citizen ${citizenData.name}:`, error.message);
    }
  }
  
  return createdCitizens;
};

/**
 * Generate complaint number
 */
const generateComplaintNumber = async () => {
  const year = new Date().getFullYear();
  const lastComplaint = await Complaint.findOne({
    complaintNumber: new RegExp(`^SUV${year}\\d{6}$`)
  }).sort({ complaintNumber: -1 });
  
  let sequence = 1;
  if (lastComplaint) {
    const lastSequence = parseInt(lastComplaint.complaintNumber.slice(-6));
    sequence = lastSequence + 1;
  }
  
  return `SUV${year}${sequence.toString().padStart(6, '0')}`;
};

/**
 * Seed complaints with mixed statuses
 */
const seedComplaints = async (citizens, departments, subDepartments, officers) => {
  console.log('📋 Seeding complaints...');
  const createdComplaints = [];
  const statuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  
  // Create complaints for each department
  for (const [deptCode, subDeptList] of Object.entries(subDepartments)) {
    const department = departments[deptCode];
    
    for (const subDepartment of subDeptList) {
      // Create 2-3 complaints per sub-department
      const complaintsCount = Math.floor(Math.random() * 2) + 2; // 2-3 complaints
      
      for (let i = 0; i < complaintsCount; i++) {
        try {
          const citizen = citizens[Math.floor(Math.random() * citizens.length)];
          const template = DEMO_DATA.complaintTemplates[Math.floor(Math.random() * DEMO_DATA.complaintTemplates.length)];
          const status = statuses[Math.floor(Math.random() * statuses.length)];
          const priority = priorities[Math.floor(Math.random() * priorities.length)];
          
          const complaintNumber = await generateComplaintNumber();
          
          // Find officer for this sub-department
          const assignedOfficer = officers.find(officer => 
            officer.assignedSubDepartment.toString() === subDepartment._id.toString()
          );
          
          const complaint = new Complaint({
            complaintNumber,
            citizen: citizen._id,
            title: `${template.title} - ${subDepartment.name}`,
            description: `${template.description} Location: ${citizen.address}`,
            category: template.category,
            priority: priority,
            status: status,
            department: department._id,
            subDepartment: subDepartment._id,
            assignedOfficer: status !== 'PENDING' ? assignedOfficer?._id : undefined,
            location: {
              address: citizen.address,
              latitude: 28.6139 + (Math.random() - 0.5) * 0.1, // Random location around Delhi
              longitude: 77.2090 + (Math.random() - 0.5) * 0.1
            },
            remarks: status === 'RESOLVED' ? [{
              message: 'Issue resolved successfully',
              addedBy: assignedOfficer?._id,
              addedAt: new Date()
            }] : []
          });
          
          await complaint.save();
          createdComplaints.push(complaint);
          
          console.log(`   ✅ Created complaint: ${complaintNumber} - ${template.title} (${status})`);
        } catch (error) {
          console.error(`   ❌ Error creating complaint:`, error.message);
        }
      }
    }
  }
  
  return createdComplaints;
};

/**
 * Display seeded credentials for demo purposes
 */
const displayCredentials = (superAdmin, officerCredentials, citizens) => {
  console.log('\n' + '='.repeat(80));
  console.log('🎉 DEMO DATA SEEDING COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(80));
  
  console.log('\n👑 SUPER ADMIN CREDENTIALS:');
  console.log('━'.repeat(50));
  console.log(`Email: ${superAdmin.adminEmail}`);
  console.log(`Password: 123456`);
  console.log(`Login Endpoint: POST /api/auth/admin/login`);
  
  console.log('\n👮 OFFICER CREDENTIALS:');
  console.log('━'.repeat(50));
  officerCredentials.forEach((officer, index) => {
    console.log(`${index + 1}. ${officer.officerName}`);
    console.log(`   Officer ID: ${officer.officerId}`);
    console.log(`   Password: ${officer.password}`);
    console.log(`   Department: ${officer.department} / ${officer.subDepartment}`);
    console.log(`   Login Endpoint: POST /api/auth/officer/login`);
    console.log('');
  });
  
  console.log('\n👥 CITIZEN CREDENTIALS (OTP-based login):');
  console.log('━'.repeat(50));
  citizens.forEach((citizen, index) => {
    console.log(`${index + 1}. ${citizen.name}`);
    console.log(`   Mobile: ${citizen.mobileNumber}`);
    console.log(`   Email: ${citizen.email}`);
    console.log(`   Login: POST /api/auth/citizen/register (then verify OTP)`);
    console.log('');
  });
  
  console.log('\n📊 SYSTEM STATISTICS:');
  console.log('━'.repeat(50));
  console.log(`Departments: ${Object.keys(DEMO_DATA.departments).length}`);
  console.log(`Sub-Departments: ${Object.values(DEMO_DATA.subDepartments).flat().length}`);
  console.log(`Officers: ${officerCredentials.length}`);
  console.log(`Citizens: ${citizens.length}`);
  console.log(`Complaints: ~${Object.values(DEMO_DATA.subDepartments).flat().length * 2.5} (mixed statuses)`);
  
  console.log('\n🚀 READY FOR DEMO!');
  console.log('='.repeat(80));
};

/**
 * Main seeding function
 */
const seedDemoData = async () => {
  try {
    console.log('🌱 Starting SUVIDHA 2026 Demo Data Seeding...\n');
    
    // Connect to database
    await connectDatabase();
    
    // Get or create Super Admin
    const superAdmin = await getSuperAdmin();
    
    // Seed departments
    const departments = await seedDepartments(superAdmin);
    
    // Seed sub-departments
    const subDepartments = await seedSubDepartments(superAdmin, departments);
    
    // Seed officers
    const { createdOfficers, officerCredentials } = await seedOfficers(superAdmin, departments, subDepartments);
    
    // Seed citizens
    const citizens = await seedCitizens();
    
    // Seed complaints
    const complaints = await seedComplaints(citizens, departments, subDepartments, createdOfficers);
    
    // Create audit log for seeding operation
    await createAuditLog({
      action: 'DEMO_DATA_SEED',
      user: superAdmin,
      entityType: 'SYSTEM',
      entityId: null,
      details: {
        departmentsCreated: Object.keys(departments).length,
        subDepartmentsCreated: Object.values(subDepartments).flat().length,
        officersCreated: createdOfficers.length,
        citizensCreated: citizens.length,
        complaintsCreated: complaints.length,
        seedingDate: new Date()
      }
    });
    
    // Display credentials
    displayCredentials(superAdmin, officerCredentials, citizens);
    
  } catch (error) {
    console.error('❌ Demo data seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDemoData();
}

module.exports = { seedDemoData };