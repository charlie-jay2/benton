const { MongoClient } = require('mongodb');
require('dotenv').config();

exports.handler = async (event) => {
    const { MONGODB_URI } = process.env;
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        const db = client.db('cinema');
        const seatsCollection = db.collection('seats');

        if (event.httpMethod === 'POST') {
            const { seatNumber, robloxUsername } = JSON.parse(event.body);

            // Check if the seat is already booked
            const seat = await seatsCollection.findOne({ seatNumber });
            if (seat && seat.isBooked) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({ message: 'Seat is already booked' }),
                };
            }

            // Book the seat
            await seatsCollection.updateOne(
                { seatNumber },
                { $set: { isBooked: true, robloxUsername } },
                { upsert: true }
            );

            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Seat booked successfully' }),
            };
        }

        // GET request: return all seats
        if (event.httpMethod === 'GET') {
            const seats = await seatsCollection.find({}).toArray();
            return {
                statusCode: 200,
                body: JSON.stringify(seats),
            };
        }
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: 'Internal Server Error' };
    } finally {
        await client.close();
    }
};
