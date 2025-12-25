import pandas as pd
import numpy as np
from pathlib import Path


def load_data(file_path: str) -> pd.DataFrame:
    """Load CSV data into a DataFrame."""
    print(f"Loading data from {file_path}...")
    df = pd.read_csv(file_path)
    print(f"Loaded {len(df)} rows and {len(df.columns)} columns")
    return df


def analyze_data(df: pd.DataFrame) -> None:
    """Perform basic analysis on the dataset."""
    print("\n" + "="*50)
    print("DATA ANALYSIS REPORT")
    print("="*50 + "\n")

    # Basic info
    print("Dataset Overview:")
    print(f"  Shape: {df.shape}")
    print(f"  Columns: {', '.join(df.columns)}")
    print()

    # Descriptive statistics
    print("Descriptive Statistics:")
    print(df.describe())
    print()

    # NumPy operations
    numeric_columns = df.select_dtypes(include=[np.number]).columns
    if len(numeric_columns) > 0:
        print("NumPy Array Operations:")
        for col in numeric_columns:
            values = df[col].values  # Get NumPy array
            print(f"  {col}:")
            print(f"    Mean: {np.mean(values):.2f}")
            print(f"    Std Dev: {np.std(values):.2f}")
            print(f"    Min: {np.min(values):.2f}")
            print(f"    Max: {np.max(values):.2f}")
        print()

    # Missing values
    missing = df.isnull().sum()
    if missing.sum() > 0:
        print("Missing Values:")
        for col, count in missing[missing > 0].items():
            print(f"  {col}: {count}")
    else:
        print("No missing values detected")
    print()

    # Sample data
    print("First 5 rows:")
    print(df.head())
    print()

    print("="*50)
    print("Analysis complete!")
    print("="*50)


def main():
    """Main entry point."""
    # Check for custom data file
    custom_data = Path("/app/data.csv")
    default_data = Path("/app/sample_data.csv")

    if custom_data.exists():
        data_file = custom_data
        print("Using custom data file: /app/data.csv")
    else:
        data_file = default_data
        print("Using sample data file: /app/sample_data.csv")

    # Load and analyze
    df = load_data(str(data_file))
    analyze_data(df)

    # Verify libraries are working
    print("\nLibrary Verification:")
    print(f"  NumPy version: {np.__version__}")
    print(f"  Pandas version: {pd.__version__}")
    print(f"  NumPy is correctly linked: {np.test is not None}")


if __name__ == "__main__":
    main()
