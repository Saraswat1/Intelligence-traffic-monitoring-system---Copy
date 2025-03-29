import React from "react";
import { Input, Button, Table, Divider, Header, Icon, Label, Dropdown } from "semantic-ui-react";

export default class Fine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      usersData: [],
      name: "-",
      phone: "-",
      address: "-",
      model: "-",
      fineSent: false,
      fineAmount: "",
      isMissing: "",
      vehicleNumberset: "",
      vehicleNumber: "",
      isverified: false,
      selectedViolation: "",
    };
  }

  componentDidMount() {
    fetch("/user_db.json")
      .then((response) => response.json())
      .then((data) => {
        this.setState({ usersData: data });
      })
      .catch((error) => console.error("Error loading JSON:", error));
  }

  showDetails = () => {
    const vehicle_number = this.state.vehicleNumberset;
    const regex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;
    if (!regex.test(vehicle_number)) {
      alert("Invalid vehicle number. Please enter a correct vehicle number.");
      return;
    }

    const { usersData } = this.state;
    const resultData = usersData.find((y) => y.vehicleNumber === vehicle_number);

    if (!resultData) {
      alert("Vehicle not found in our database.");
      return;
    }

    this.setState({
      ...resultData,
      isverified: true,
    });
  };

  sendFine = async () => {
    const { phone, vehicleNumber, fineAmount, selectedViolation, name } = this.state;

    if (!fineAmount) {
      alert("Please select a traffic violation or enter the fine amount.");
      return;
    }

    try {
      // Send fine notification via SMS
      const response = await fetch("http://localhost:5000/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          message: `A fine of ₹${fineAmount} has been issued for vehicle ${vehicleNumber} due to ${selectedViolation}. Please pay it on time.`,
        }),
      });

      if (response.ok) {
        this.setState({ fineSent: true });
        alert("Fine sent successfully!");

        // Store fine details in backend
        await fetch("http://localhost:5001/store-fine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            vehicleNumber,
            fineAmount,
            selectedViolation,
            date: new Date().toISOString(),
          }),
        });

        alert("Fine record saved!");
      } else {
        alert("Failed to send fine notification.");
      }
    } catch (error) {
      console.error("Error sending fine:", error);
    }
  };

  handleInput = (event) => {
    this.setState({ vehicleNumberset: event.target.value });
  };

  handleViolationChange = (event, { value }) => {
    const violationFines = {
      "Over Speeding": 500,
      "Signal Jumping": 1000,
      "No Seatbelt": 300,
      "Drunk Driving": 5000,
      "Driving Dangerously": 1000,
      "Driving in NMV lanes/No entry/One-way roads": 5000,
      "Using horn in no honking or Silence zone": 1000,
      "Driving without indicator": 500,
      "Driving without licence": 5000,
      "Driving without PUCC (Pollution Under Control Certificate)": 10000,
    };

    this.setState({
      selectedViolation: value,
      fineAmount: violationFines[value],
    });
  };

  render() {
    const violationOptions = [
      { key: "os", text: "Over Speeding", value: "Over Speeding" },
      { key: "sj", text: "Signal Jumping", value: "Signal Jumping" },
      { key: "ns", text: "No Seatbelt", value: "No Seatbelt" },
      { key: "dd", text: "Drunk Driving", value: "Drunk Driving" },
      { key: "dc", text: "Driving Dangerously", value: "Driving Dangerously" },
      { key: "jh", text: "Driving in NMV lanes/No entry/One-way roads", value: "Driving in NMV lanes/No entry/One-way roads" },
      { key: "hh", text: "Using horn in no honking or Silence zone", value: "Using horn in no honking or Silence zone" },
      { key: "nn", text: "Driving without indicator", value: "Driving without indicator" },
      { key: "ml", text: "Driving without licence", value: "Driving without licence" },
      { key: "mk", text: "Driving without PUCC (Pollution Under Control Certificate)", value: "Driving without PUCC (Pollution Under Control Certificate)" }
    ];

    return (
      <div style={styles.center}>
        <div style={styles.form} className="fine">
          <Header as="h3">
            <Icon name="search" />
            <Header.Content>
              Find License Plate
              <Header.Subheader>Send Fine to the owner of the vehicle</Header.Subheader>
            </Header.Content>
          </Header>
          <Input placeholder="Enter Plate Number - AA11AA1111" onChange={this.handleInput} value={this.state.vehicleNumberset} />
          <Button primary onClick={this.showDetails}>FIND VEHICLE</Button>
          <Divider section />

          {this.state.isverified && (
            <div className="challan">
              <Header as="h3">
                <Icon name="money" />
                <Header.Content>Send Fine</Header.Content>
              </Header>
              <Dropdown placeholder="Select Traffic Violation" selection options={violationOptions} onChange={this.handleViolationChange} value={this.state.selectedViolation} />
              <Input labelPosition="right" type="text" placeholder="Fine Amount" value={this.state.fineAmount} disabled>
                <Label basic>₹</Label>
                <input />
                <Label>.00</Label>
              </Input>
              {this.state.fineSent ? (
                <Button color="green"><Icon name="check" /> FINE SENT</Button>
              ) : (
                <Button color="blue" onClick={this.sendFine}>SEND FINE</Button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
}

const styles = {
  center: { display: "flex", justifyContent: "center", height: "100%", padding: 20 },
  form: { display: "flex", flexDirection: "column", padding: 20 },
};
