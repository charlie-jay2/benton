const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGODB_URI; // MongoDB URI in your environment variables
const client = new MongoClient(uri);
const dbName = "cinema";
const collectionName = "seats";

exports.handler = async (event, context) => {
    const { action, seatId, seatIds } = JSON.parse(event.body);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    try {
        if (action === "getAll") {
            // Fetch all booked seats
            const bookedSeats = await collection.find({ isBooked: true }).toArray();
            return {
                statusCode: 200,
                body: JSON.stringify(bookedSeats),
            };
        } else if (action === "delete" && seatId) {
            // Delete a specific booking
            const result = await collection.deleteOne({ _id: new ObjectId(seatId) });
            return {
                statusCode: 200,
                body: JSON.stringify({ success: result.deletedCount === 1 }),
            };
        } else if (action === "deleteMany" && seatIds) {
            // Delete multiple bookings
            const result = await collection.deleteMany({ _id: { $in: seatIds.map(id => new ObjectId(id)) } });
            return {
                statusCode: 200,
                body: JSON.stringify({ success: result.deletedCount > 0 }),
            };
        } else {
            return { statusCode: 400, body: JSON.stringify({ error: "Invalid action" }) };
        }
    } catch (error) {
        console.error("Error in admin operation:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Internal Server Error" }) };
    } finally {
        client.close();
    }
};

