class AddMacAddressToLabSessions < ActiveRecord::Migration
  def change
    add_column :lab_sessions, :mac_address, :string
  end
end
