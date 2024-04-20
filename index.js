import express from 'express';
import { JSONFilePreset } from 'lowdb/node';
import bodyParser from 'body-parser';
import cors from 'cors';

const app = express();
const port = 3000;

app.use(cors());

const db = await JSONFilePreset('db.json', { devices: [] });

app.use(bodyParser.json());

app.get('/devices', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.send(JSON.stringify(db.data.devices, undefined, 4));
});

app.get('/device/:deviceId', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	var device = db.data.devices.find((e) => e.id == req.params.deviceId);
	if (!device) {
		res.sendStatus(404);
		return;
	}
	device.subSensors = db.data.devices.filter((e) => e.parentId == device.id);
	res.send(JSON.stringify(device, undefined, 4));
});

app.post('/device/:deviceId', async (req, res) => {
	var e = db.data.devices.find((e) => e.id == req.params.deviceId);
	if (!e) {
		e = { id: db.data.devices.length };
		db.data.devices.push(e);
		await db.write();
	}
	e.readings = e?.readings ?? [];
	e.readings.push(req.body);
	await db.write();
	res.sendStatus(200);
});

app.put('/device/:deviceId', async (req, res) => {
	const e = db.data.devices.find((e) => e.id == req.params.deviceId);
	if (!e) {
		e = db.data.devices.push({ id: db.data.devices.length });
		await db.write();
	}
	e.value = req.body.value;
	await db.write();
	res.sendStatus(200);
});

app.post('/device/:deviceId/command', async (req, res) => {
	// setup system for native handling of individual device types
});

app.listen(port, () => {
	console.log(`SmartHome app listening on port ${port}`);
});
