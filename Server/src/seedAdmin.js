import { User } from "./models/user.model.js";

const seedAdmin = async () => {
  try {
    const adminEmail = "admin@wearyourstyle.com";
    const existingAdmin = await User.findByEmail(adminEmail);

    if (!existingAdmin) {
      console.log("Creating Admin User...");
      await User.create({
        firstName: "Admin",
        lastName: "User",
        email: adminEmail,
        password: "admin@1031",
        role: "admin"
      });
      console.log("✅ Admin user created successfully!");
    } else {
      console.log("ℹ️ Admin user already exists.");
    }
  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);
  }
};

export default seedAdmin;
