// test_download.js

// 1. Setup the model details and your token
const MODEL_ID = "Tongyi-MAI/Z-Image-Turbo";
const FILE_TO_TEST = "config.json"; // A small file to test connectivity
// usage of the token you provided:

// 2. Construct the file URL (using the 'resolve' endpoint for raw file download)
const fileUrl = `https://huggingface.co/${MODEL_ID}/resolve/main/${FILE_TO_TEST}`;

console.log(`Checking access to: ${MODEL_ID}...`);

async function checkDownload() {
  try {
    // 3. Make the request with the Authorization header
    const response = await fetch(fileUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
      },
    });

    // 4. Check the result
    if (response.ok) {
      console.log("✅ SUCCESS: Access granted!");
      console.log(`   Successfully downloaded ${FILE_TO_TEST}`);
      console.log("   Status Code:", response.status);
      
      // Optional: Print a snippet of the file to prove it works
      const data = await response.json();
      console.log("   File snippet (architectures):", data.architectures);
      console.log("\nYou can now proceed to write your Python code.");
    } else {
      console.error("❌ FAILED: Could not download file.");
      console.error("   Status Code:", response.status);
      console.error("   Reason:", response.statusText);
      
      if (response.status === 401) {
        console.log("   -> Tip: Your token might be invalid or missing.");
      } else if (response.status === 403) {
        console.log("   -> Tip: You might not have accepted the license agreement for Llama-3.2.");
        console.log("      Go here to accept it: https://huggingface.co/meta-llama/Llama-3.2-1B");
      }
    }
  } catch (error) {
    console.error("❌ ERROR: Network or script error.");
    console.error(error);
  }
}

// Run the test
checkDownload();