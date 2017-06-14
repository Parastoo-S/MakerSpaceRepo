require 'test_helper'

class Admin::TrainingsControllerTest < ActionController::TestCase
  setup do
    session[:user_id] = User.find_by(username: "adam").id
    session[:expires_at] = "Sat, 03 Jun 2020 05:01:41 UTC +00:00"
    #@staff = User.find_by(username: "adam")
    @request.env['HTTP_REFERER'] = admin_settings_url
  end

  test "admin can add training" do
    post :add_training, training_name: "soldering_1"
    assert_equal flash[:notice], "Training added successfully!"
    assert Training.find_by(name: "soldering_1").present?
    assert_redirected_to admin_settings_path
  end

  test "admin can rename training" do
    patch :rename_training, training_name: "lathe_1", training_new_name: "lathe_2"
    assert_equal flash[:notice], "Training renamed successfully"
    refute Training.find_by(name: "lathe_1").present?
    assert Training.find_by(name: "lathe_2").present?
    assert_redirected_to admin_settings_path
  end

  test "admin can remove training" do
    delete :remove_training, training_name: "lathe_1"
    assert_equal flash[:notice], "Training removed successfully"
    refute Training.find_by(name: "lathe_1").present?
    assert_redirected_to admin_settings_path
  end

end
