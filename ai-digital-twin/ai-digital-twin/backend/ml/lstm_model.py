# lstm_model.py — Defines the LSTM neural network for fatigue prediction

import torch
import torch.nn as nn

class FatigueLSTM(nn.Module):
    """
    LSTM model that takes a sequence of behavioral data (past N days)
    and predicts the next day's fatigue score.

    Input shape:  (batch_size, sequence_length, input_size)
                   e.g., (32, 7, 3) = 32 samples, 7 days, 3 features
    Output shape: (batch_size, 1) — a single fatigue score
    """

    def __init__(self, input_size=3, hidden_size=64, num_layers=2, output_size=1):
        super(FatigueLSTM, self).__init__()

        self.hidden_size = hidden_size
        self.num_layers = num_layers

        # The core LSTM layer — learns patterns across time steps (days)
        self.lstm = nn.LSTM(
            input_size=input_size,      # Features per time step: sleep, screen, steps
            hidden_size=hidden_size,    # Internal memory size (neurons)
            num_layers=num_layers,      # Stack 2 LSTM layers for better learning
            batch_first=True,           # Input shape: (batch, seq, features)
            dropout=0.2                 # Dropout regularization to prevent overfitting
        )

        # Fully connected output layer — maps LSTM output to a single number
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        """
        Forward pass: takes input x, runs it through LSTM, returns fatigue score.
        """
        # Initialize hidden state and cell state with zeros
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)

        # Run through LSTM — out contains all time step outputs
        out, _ = self.lstm(x, (h0, c0))

        # Take only the LAST time step output (most recent day's summary)
        last_output = out[:, -1, :]

        # Pass through linear layer to get final prediction
        prediction = self.fc(last_output)
        return prediction
