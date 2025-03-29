import React from "react";
import data from "./regis_db.json"; // Import JSON file (for search only)
import { Input, Button, Table, Divider, Header, Icon, Form } from "semantic-ui-react";

export default class Fine extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: "-",
      phone: "-",
      address: "-",
      model: "-",
      isMissing: "No",
      vehicleNumber: "",
      isverified: false,
      vehicleNumberset: "",

      // Registration Form State
      showRegisterForm: false,
      newVehicle: {
        vehicleNumber: "",
        name: "",
        phone: "",
        address: "",
        isMissing: "No",
        missingLocation: "",
        model: "",
      },
    };
  }

  // FIND VEHICLE FUNCTION
  showDetails = () => {
    const vehicle_number = this.state.vehicleNumberset.trim().toUpperCase();
    const regex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;

    if (!regex.test(vehicle_number)) {
      alert("Invalid vehicle number. Format: WB12AB3456");
      return;
    }

    const foundVehicle = data.find(
      (car) => car.vehicleNumber.trim().toUpperCase() === vehicle_number
    );

    if (!foundVehicle) {
      alert("🚨 Vehicle not found in our database");
      return;
    }

    this.setState({
      ...foundVehicle,
      isverified: true,
    });

    console.log("✅ Vehicle found:", foundVehicle);
  };

  handleInput = (event) => {
    this.setState({ vehicleNumberset: event.target.value });
  };

  // TOGGLE REGISTRATION FORM
  toggleRegisterForm = () => {
    this.setState((prevState) => ({
      showRegisterForm: !prevState.showRegisterForm,
    }));
  };

  // HANDLE REGISTRATION FORM INPUTS
  handleRegistrationInput = (event) => {
    const { name, value } = event.target;
    this.setState((prevState) => ({
      newVehicle: {
        ...prevState.newVehicle,
        [name]: value,
      },
    }));
  };

  // REGISTER NEW VEHICLE (Save to Backend)
  registerVehicle = async () => {
    const { newVehicle } = this.state;
    const { vehicleNumber, name, phone, address, isMissing, missingLocation, model } = newVehicle;

    if (!vehicleNumber || !name || !phone || !address || !model) {
      alert("❌ Please fill in all fields!");
      return;
    }

    const formattedVehicleNumber = vehicleNumber.trim().toUpperCase();
    const regex = /^[A-Z]{2}[0-9]{2}[A-Z]{2}[0-9]{4}$/;

    if (!regex.test(formattedVehicleNumber)) {
      alert("Invalid vehicle number format. Format: WB12AB3456");
      return;
    }

    const newEntry = {
      vehicleNumber: formattedVehicleNumber,
      name,
      phone,
      address,
      isMissing,
      missingLocation: isMissing === "Yes" ? missingLocation : "",
      model,
    };

    try {
      const response = await fetch("http://localhost:5004/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEntry),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        console.log("📌 New vehicle added:", newEntry);
      } else {
        alert(data.message);
      }

      // Reset form
      this.setState({
        newVehicle: {
          vehicleNumber: "",
          name: "",
          phone: "",
          address: "",
          isMissing: "No",
          missingLocation: "",
          model: "",
        },
      });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  render() {
    return (
      <div className="container">
        {/* FIND VEHICLE SECTION */}
        <div className="search-section">
          <Header as="h3">
            <Icon name="search" />
            <Header.Content>
              Show Vehicle Details
              <Header.Subheader>Find the owner of the vehicle</Header.Subheader>
            </Header.Content>
          </Header>
          <Input
            placeholder="Enter Plate Number - WB12AB3456"
            onChange={this.handleInput}
            value={this.state.vehicleNumberset}
          />
          <Button primary onClick={this.showDetails}>FIND DETAILS</Button>
        </div>

        {/* DISPLAY VEHICLE DETAILS */}
        {this.state.isverified && (
          <div className="vehicle-details">
            <Header as="h3">
              <Icon name="info circle" />
              <Header.Content>
                Vehicle Details
                <Header.Subheader>Owner and vehicle information</Header.Subheader>
              </Header.Content>
            </Header>

            <Table celled>
              <Table.Body>
                <Table.Row>
                  <Table.Cell><strong>Owner Name:</strong></Table.Cell>
                  <Table.Cell>{this.state.name}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell><strong>Phone:</strong></Table.Cell>
                  <Table.Cell>{this.state.phone}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell><strong>Address:</strong></Table.Cell>
                  <Table.Cell>{this.state.address}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell><strong>Model:</strong></Table.Cell>
                  <Table.Cell>{this.state.model}</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell><strong>Missing Status:</strong></Table.Cell>
                  <Table.Cell>{this.state.isMissing === "Yes" ? "❌ Missing" : "✅ Not Missing"}</Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </div>
        )}

        <Divider section />

        {/* REGISTER VEHICLE TOGGLE BUTTON */}
        <Button color="green" onClick={this.toggleRegisterForm}>
          {this.state.showRegisterForm ? "Close Registration Form" : "Register New Vehicle"}
        </Button>

        {/* REGISTER VEHICLE FORM */}
        {this.state.showRegisterForm && (
          <div className="form-container">
            <Header as="h3">
              <Icon name="car" />
              <Header.Content>
                Register New Vehicle
                <Header.Subheader>Add a new vehicle to the database</Header.Subheader>
              </Header.Content>
            </Header>
            <Form>
              <Form.Field>
                <label>Vehicle Number</label>
                <Input name="vehicleNumber" value={this.state.newVehicle.vehicleNumber} onChange={this.handleRegistrationInput} />
              </Form.Field>
              <Form.Field>
                <label>Owner Name</label>
                <Input name="name" value={this.state.newVehicle.name} onChange={this.handleRegistrationInput} />
              </Form.Field>
              <Form.Field>
                <label>Phone</label>
                <Input name="phone" value={this.state.newVehicle.phone} onChange={this.handleRegistrationInput} />
              </Form.Field>
              <Form.Field>
                <label>Address</label>
                <Input name="address" value={this.state.newVehicle.address} onChange={this.handleRegistrationInput} />
              </Form.Field>
              <Form.Field>
                <label>Model</label>
                <Input name="model" value={this.state.newVehicle.model} onChange={this.handleRegistrationInput} />
              </Form.Field>
              <Form.Field>
                <label>Is Missing?</label>
                <select name="isMissing" value={this.state.newVehicle.isMissing} onChange={this.handleRegistrationInput}>
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </Form.Field>
              <Button color="green" onClick={this.registerVehicle}>REGISTER VEHICLE</Button>
            </Form>
          </div>
        )}
      </div>
    );
  }
}
