# Anonymous Charity Take-home

This is a solution that I submitted for a take-home technology screen job interview. This version has been modified to anonymize the company.

## Requirements

- Write a command line program.
- Read charities and a user profile from CSV files.
- Select 12 random charities total.
- Select between 1 and 5 state-featured charities that match the user profile state.
- Select between 4 and 12 animal related charities.

## Installation

```
npm ci
npm run build
```

## Usage

```
npm run get-charities <charities-file-path> <profile-file-path>
```

### Example

```
npm run get-charities charities.csv profile.csv
```

## Tests

```
npm run test
```
