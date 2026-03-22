import { clerkClient } from '@clerk/nextjs/server';
import dotenv from 'dotenv';
dotenv.config();

async function findUserByEmail() {
  const email = 'reymndbrn15@gmail.com';
  console.log(`Searching for user: ${email}`);

  try {
    const client = await clerkClient();
    const response = await client.users.getUserList({ emailAddress: [email] });
    
    if (response.data.length > 0) {
      const user = response.data[0];
      console.log('User found in Clerk:');
      console.log(`ID: ${user.id}`);
      console.log(`Name: ${user.firstName} ${user.lastName}`);
      console.log(`Primary Email: ${user.emailAddresses.find(e => e.id === user.primaryEmailAddressId)?.emailAddress}`);
      console.log('Public Metadata:', user.publicMetadata);
    } else {
      console.log('User not found in Clerk.');
    }
  } catch (error) {
    console.error('Error searching Clerk:', error);
  }
}

findUserByEmail();
