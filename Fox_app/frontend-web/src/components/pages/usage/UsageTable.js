import React from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton
} from "@mui/material";
import { Edit, Delete, Visibility } from "@mui/icons-material";

const UsagePage = () => {
  const usageData = [
    { id: 1, date: "8/1/2025", fixture_id: "NV-NCT01-1", event_type: "Weekly_Maintenance", outage_time: "30 mins", comments: "Everything is normal" },
    { id: 2, date: "8/2/2025", fixture_id: "NV-NCT01-2", event_type: "Emergency_Maintenance", outage_time: "60 mins", comments: "Replaced riser" },
    { id: 3, date: "8/3/2025", fixture_id: "NV-NCT01-3", event_type: "Partial_Active", outage_time: "30 mins", comments: "Left Slot is down" },
    { id: 4, date: "8/4/2025", fixture_id: "NV-NCT01-4", event_type: "Admin_Disabled", outage_time: "120 mins", comments: "Waiting for parts" },
    { id: 5, date: "8/5/2025", fixture_id: "NV-NCT02-1", event_type: "Needs_Maintenance", outage_time: "30 mins", comments: "Waiting for TE" },
    { id: 6, date: "8/6/2025", fixture_id: "NV-NCT02-2", event_type: "TE_testing", outage_time: "30 mins", comments: "Used by Thay" },
    { id: 7, date: "8/7/2025", fixture_id: "NV-NCT02-3", event_type: "Other", outage_time: "330 mins", comments: "Any other event" },
    { id: 8, date: "8/8/2025", fixture_id: "NV-NCT02-4", event_type: "Next_Maintenance", outage_time: "30 mins", comments: "Next scheduled maintenance" },
  ];

  return (
    <Box p={3}>
      <Typography variant="h5" gutterBottom>
        Usage - TAB 2
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
        <Table>
          <TableHead sx={{ backgroundColor: "#1976d2" }}>
            <TableRow>
              <TableCell sx={{ color: "white" }}>Date</TableCell>
              <TableCell sx={{ color: "white" }}>Fixture_ID</TableCell>
              <TableCell sx={{ color: "white" }}>Event_Type</TableCell>
              <TableCell sx={{ color: "white" }}>Outage_Time</TableCell>
              <TableCell sx={{ color: "white" }}>Comments</TableCell>
              <TableCell sx={{ color: "white" }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {usageData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.fixture_id}</TableCell>
                <TableCell>{row.event_type}</TableCell>
                <TableCell>{row.outage_time}</TableCell>
                <TableCell>{row.comments}</TableCell>
                <TableCell>
                  <IconButton color="primary">
                    <Edit />
                  </IconButton>
                  <IconButton color="error">
                    <Delete />
                  </IconButton>
                  <IconButton color="secondary">
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UsagePage;