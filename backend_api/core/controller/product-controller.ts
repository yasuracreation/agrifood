import { Request, Response } from 'express';
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider('http://localhost:8545'); // Replace with your local Ethereum node URL
const web3 = new Web3(provider);
const TruffleContract = require('@truffle/contract');
const { spawn } = require('child_process');
const path = require('path');
// import * as tf from '@tensorflow/tfjs-node';
class FoodController {
    
    async createFoodProduct(req: Request, res: Response) {
        try {
         
            const isValid = await this.validateFoodQuality(req.body);

            if (isValid) {
              
                const blockchainResult = await this.passToBlockchain(req.body);

              
                await this.addToTrainingDataset(req.body);

              
                return res.status(200).json({ message: 'Food product created successfully', blockchainResult });
            } else {
                return res.status(400).json({ message: 'Invalid food quality. Cannot create the product.' });
            }
        } catch (error) {
            return res.status(500).json({ error: (error as Error).message });
        }
    }
    async  getContractAddress(contractAbi: any[], deployerAddress: string, deployerNonce: number): Promise<string> {
        const SimpleContract = TruffleContract({
            abi: contractAbi,
        });
    
        SimpleContract.setProvider(provider);
    
        // Deployer's address and nonce are used to calculate the contract address
        const deployerAddressChecksum = web3.utils.toChecksumAddress(deployerAddress);
        const contractAddress = web3.utils.toChecksumAddress(
            web3.utils.sha3(
                web3.utils.rlp.encode([deployerAddressChecksum, deployerNonce])
            ).slice(26)
        );
    
        return contractAddress;
    }
    // Update food product
    async updateFoodProduct(req: Request, res: Response) {
        // Implement the update logic here
    }

    // Delete food product
    async deleteFoodProduct(req: Request, res: Response) {
        // Implement the delete logic here
    }

    // Read food product with prediction
    async readFoodProduct(req: Request, res: Response) {
        try {
            // Read the food product details from the database
            const foodProduct = await this.getFoodProductDetails(req.params.productId);

            // Check the prediction about the food using ML model
            const prediction: never[] = [] //await this.checkFoodQualityPrediction(foodProduct);

            // Respond with the food product details and prediction
            return res.status(200).json({ foodProduct, prediction });
        } catch (error) {
            return res.status(500).json({ error: (error as Error).message });
        }
    }

    // Other utility functions...

    // Function to validate food quality using machine learning
    private async validateFoodQuality(foodData: any): Promise<boolean> {
        // Implement the validation logic using machine learning
        // Return true if food quality is valid, false otherwise
        return true;
    }

    // Function to pass food data to the blockchain
    private async passToBlockchain(foodData: any): Promise<any> {
        try {
            const web3 = new Web3('http://localhost:7545');  // Replace with your Ethereum node endpoint
            const accounts = await web3.eth.getAccounts();

           // Replace the following with your smart contract ABI and address
            const contractAbi = [
                {
                "constant": true,
                "inputs": [],
                "name": "getFoodProduct",
                "outputs": [
                    {
                    "name": "",
                    "type": "string"
                    }
                ],
                "payable": false,
                "stateMutability": "view",
                "type": "function"
                },
                // ... other ABI entries
            ];
  
            const contractAddress = '0x1234567890123456789012345678901234567890';
  
            const contract = new web3.eth.Contract(contractAbi, contractAddress);

            // Assuming your smart contract has a method 'addFoodProduct' for adding food to the blockchain
            const result = await contract.methods.addFoodProduct(foodData).send({
                from: accounts[0],
                gas: 3000000, 
            });
            this.getTransactionLatency(result).then(latency => {
                console.log(`Transaction Latency: ${latency} seconds`);
            });
            return result;  
        } catch (error:any) {
            throw new Error(`Failed to interact with the blockchain: ${error.message}`);
        }
    }

    private async addToTrainingDataset(foodData: any): Promise<void> {
        try {
           
            const dataToSave = {
                feature1: foodData.feature1,
                feature2: foodData.feature2,
                // Add other features as needed
                label: foodData.label,  // Assuming 'label' is the target variable
            };
    
            // Save data to a CSV file (you might need to adjust this based on your data structure)
            const datasetPath = 'training_dataset.csv';
            await this.saveToCSV(dataToSave, datasetPath);
    
            // Execute the Python script
            const pythonScriptPath = path.join(__dirname, './train_model.py');
            const pythonProcess = spawn('python', [pythonScriptPath, datasetPath]);
    
            // Handle Python script output
            pythonProcess.stdout.on('data', (data: any) => {
                console.log(`Python Script Output: ${data}`);
            });
    
            pythonProcess.stderr.on('data', (data: any) => {
                console.error(`Python Script Error: ${data}`);
            });
    
            // Wait for the Python script to finish
            await new Promise<void>((resolve) => {
                pythonProcess.on('close', (code: any) => {
                    console.log(`Python Script exited with code ${code}`);
                    resolve();
                });
            });
    
        } catch (error:any) {
            console.error('Error adding to training dataset:', error);
            throw new Error('Error adding to training dataset:');
        }
    }
    
    // Function to save data to a CSV file
    async  saveToCSV(_data:any, _filePath:string) {
        // Implement logic to convert data to CSV format and save to the file
        // You can use libraries like 'fast-csv' or 'papaparse' for CSV operations
    }

    // Function to get food product details from the database
    private async getFoodProductDetails(productId: string): Promise<any> {
        // Implement the logic to fetch food product details from the database
    }

    // private async checkFoodQualityPrediction(foodProduct: any): Promise<any> {
    //     try {
    //         // Load the pre-trained machine learning model
    //         const model = await tf.loadLayersModel('./../model.json');

    //         // Preprocess the input data (foodProduct) if needed
    //         const processedData = this.preprocessData(foodProduct);

    //         // Convert the input data to a TensorFlow tensor
    //         const inputData = tf.tensor2d([processedData]);

    //         // Make predictions using the loaded model
    //         const predictions = model.predict(inputData) as tf.Tensor;

    //         // Convert predictions to JavaScript array
    //         const predictionsArray = Array.from(predictions.dataSync());

    //         // Determine the quality based on predictions
    //         const foodQuality = this.determineFoodQuality(predictionsArray);

    //         // Return the predicted food quality
    //         return foodQuality;
    //     } catch (error) {
    //         throw new Error((error as Error).message);
    //     }
    // }

    // Other utility functions...

    // Function to preprocess input data if needed
    private preprocessData(foodProduct: any): any {
        // Implement preprocessing logic if required
        return foodProduct;
    }

    // Function to determine food quality based on predictions
    private determineFoodQuality(predictions: number[]): string {
        // Implement logic to determine food quality based on model predictions
        // This can be a simple threshold-based approach or more complex logic
        // Return 'Good' or 'Bad' based on the determined quality
        const threshold = 0.5; // Adjust as needed
        return predictions[0] >= threshold ? 'Good' : 'Bad';
    }

    async  getTransactionLatency(transactionHash: string): Promise<number> {
        const transaction = await web3.eth.getTransaction(transactionHash);
        const block = await web3.eth.getBlock(transaction.blockNumber);
    
        const transactionTimestamp = transaction.input.timestamp as number; // Replace with the actual timestamp attribute
        const blockTimestamp = block.timestamp;
    
        const latency = blockTimestamp - transactionTimestamp;
        return latency;
    }
    
   
}

export default FoodController;
