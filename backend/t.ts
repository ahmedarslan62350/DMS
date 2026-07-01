// import mongoose from "mongoose";

// mongoose.connect(
//   "mongodb+srv://test:mp40max123@cluster0.tvjkven.mongodb.net/test"
// )
// .then(async () => {
//   console.log("Connected to MongoDB");

//   // Define the Company schema inline for this migration script
//   const companySchema = new mongoose.Schema({
//     intId: Number,
//     companyName: String,
//     joiningDate: Date,
//     dialerLink: String,
//     password: String,
//     noOfServers: Number,
//     serverCharges: Number,
//     renewalDate: Date,
//     status: String,
//     comment: String,
//     additionalComment: String,
//     inactiveDate: Date,
//     createdBy: mongoose.Schema.Types.ObjectId,
//     updatedBy: mongoose.Schema.Types.ObjectId,
//   }, { timestamps: true });

//   const Company = mongoose.model("Company", companySchema);

//   // Find the highest existing intId
//   const greatestIntId = await Company.findOne().sort({ intId: -1 }).select("intId");
//   const startingIntId = (greatestIntId && greatestIntId.intId) ? greatestIntId.intId + 1 : 1;

//   // Find all companies without intId, sorted by createdAt (oldest first)
//   const companiesWithoutIntId = await Company.find({ intId: { $exists: false } })
//     .sort({ createdAt: 1 });

//   console.log(`Found ${companiesWithoutIntId.length} companies without intId`);

//   if (companiesWithoutIntId.length === 0) {
//     console.log("No companies need migration. All records already have intId.");
//     process.exit(0);
//   }

//   // Update each company with a sequential intId
//   let currentIntId = startingIntId;
//   let updatedCount = 0;

//   for (const company of companiesWithoutIntId) {
//     await Company.findByIdAndUpdate(company._id, { intId: currentIntId });
//     console.log(`Updated company "${company.companyName}" with intId: ${currentIntId}`);
//     currentIntId++;
//     updatedCount++;
//   }

//   console.log(`Migration completed. Updated ${updatedCount} companies.`);
//   console.log(`intIds assigned from ${startingIntId} to ${currentIntId - 1}`);

//   process.exit(0);
// })
// .catch(err => {
//   console.error("Error:", err);
//   process.exit(1);
// });